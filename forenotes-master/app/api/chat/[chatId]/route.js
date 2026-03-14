//chat/[chatId]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Chat from '@/models/Chat';

// Helper function to generate chat title from first user message
function generateChatTitle(firstMessage) {
  if (!firstMessage) return "New Chat";
  
  // Clean and truncate the message for title
  let title = firstMessage.trim();
  
  // Remove common prefixes
  const prefixesToRemove = [
    'analyze my',
    'tell me about',
    'what about',
    'can you',
    'please',
    'help me with',
    'explain'
  ];
  
  const lowerTitle = title.toLowerCase();
  for (const prefix of prefixesToRemove) {
    if (lowerTitle.startsWith(prefix)) {
      title = title.substring(prefix.length).trim();
      break;
    }
  }
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  // Truncate if too long
  if (title.length > 50) {
    title = title.substring(0, 47) + "...";
  }
  
  return title || "New Chat";
}

// POST: Save new message to chat with userId validation
export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const { chatId } = await params;
    const { 
      message, 
      response, 
      sessionId, // Now optional
      userId, // Required
      title,
      tradeDataSummary 
    } = await request.json();

    console.log('Saving chat message:', { chatId, userId, messageLength: message?.length });

    // UPDATED: sessionId is now optional
    if (!message || !response || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: message, response, and userId' },
        { status: 400 }
      );
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({ chatId });
    
    if (!chat) {
      const chatTitle = title || generateChatTitle(message);
      
      chat = new Chat({
        chatId,
        title: chatTitle,
        userId,
        sessionId: sessionId || null, // Optional - store if provided
        messages: [],
        tradeDataSummary: tradeDataSummary || {}
      });
      
      console.log('Created new chat:', chatTitle, 'for user:', userId);
    } else {
      // Validate that the chat belongs to the user
      if (chat.userId !== userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Chat does not belong to this user' },
          { status: 403 }
        );
      }
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Add bot response
    chat.messages.push({
      role: 'bot',
      content: response,
      timestamp: new Date()
    });

    // Update trade data summary if provided
    if (tradeDataSummary) {
      chat.tradeDataSummary = tradeDataSummary;
    }

    await chat.save();

    console.log(`Saved chat ${chatId} for user ${userId} with ${chat.messages.length} total messages`);

    return NextResponse.json({
      success: true,
      chatId: chat.chatId,
      title: chat.title,
      userId: chat.userId,
      messageCount: chat.messages.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error saving chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save chat', details: error.message },
      { status: 500 }
    );
  }
}

// GET: Retrieve chat history with userId validation
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { chatId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const userId = searchParams.get('userId');

    console.log('Retrieving chat:', { chatId, userId, limit, offset });

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // sessionId is now optional in the query
    const chat = await Chat.findOne({ 
      chatId, 
      userId,
      isActive: true 
    }).select({
      title: 1,
      userId: 1,
      messages: { $slice: [offset, limit] },
      sessionId: 1, // Still include in response if it exists
      tradeDataSummary: 1,
      createdAt: 1,
      updatedAt: 1
    });

    if (!chat) {
      return NextResponse.json(
        { success: false, error: 'Chat not found or access denied' },
        { status: 404 }
      );
    }

    // Format messages for frontend
    const formattedMessages = chat.messages.map((msg, index) => ({
      id: offset + index + 1,
      type: msg.role === 'user' ? 'user' : 'bot',
      content: msg.content,
      timestamp: msg.timestamp.toLocaleTimeString(),
      fullTimestamp: msg.timestamp
    }));

    return NextResponse.json({
      success: true,
      chat: {
        chatId: chat.chatId,
        title: chat.title,
        userId: chat.userId,
        sessionId: chat.sessionId,
        messages: formattedMessages,
        tradeDataSummary: chat.tradeDataSummary,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        totalMessages: chat.messages.length
      }
    });

  } catch (error) {
    console.error('Error retrieving chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve chat', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete chat with userId validation
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { chatId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Required parameter

    console.log('Deleting chat:', { chatId, userId });

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find and delete chat with userId validation
    const deletedChat = await Chat.findOneAndUpdate(
      { 
        chatId, 
        userId, // Ensure chat belongs to user
        isActive: true 
      },
      { isActive: false }, // Soft delete
      { new: true }
    );

    if (!deletedChat) {
      return NextResponse.json(
        { success: false, error: 'Chat not found or access denied' },
        { status: 404 }
      );
    }

    console.log(`Deleted chat: ${deletedChat.title} for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Chat deleted successfully',
      deletedChat: {
        chatId: deletedChat.chatId,
        title: deletedChat.title,
        userId: deletedChat.userId
      }
    });

  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete chat', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update chat title or other properties with userId validation
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const { chatId } = params;
    const { title, userId, tradeDataSummary } = await request.json();

    console.log('Updating chat:', { chatId, userId, title });

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find and update chat with userId validation
    const updateData = {};
    if (title) updateData.title = title;
    if (tradeDataSummary) updateData.tradeDataSummary = tradeDataSummary;
    updateData.updatedAt = new Date();

    const updatedChat = await Chat.findOneAndUpdate(
      { 
        chatId, 
        userId, // Ensure chat belongs to user
        isActive: true 
      },
      updateData,
      { new: true }
    );

    if (!updatedChat) {
      return NextResponse.json(
        { success: false, error: 'Chat not found or access denied' },
        { status: 404 }
      );
    }

    console.log(`Updated chat: ${updatedChat.title} for user: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Chat updated successfully',
      chat: {
        chatId: updatedChat.chatId,
        title: updatedChat.title,
        userId: updatedChat.userId,
        updatedAt: updatedChat.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update chat', details: error.message },
      { status: 500 }
    );
  }
}






