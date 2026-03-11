//chats/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Chat from '@/models/Chat';

// Helper function to auto-delete old chats (30+ days)
async function autoDeleteOldChats() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Chat.updateMany(
      {
        createdAt: { $lt: thirtyDaysAgo },
        isActive: true
      },
      {
        isActive: false,
        autoDeletedAt: new Date()
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`Auto-deleted ${result.modifiedCount} chats older than 30 days`);
    }

    return result.modifiedCount;
  } catch (error) {
    console.error('Error auto-deleting old chats:', error);
    return 0;
  }
}

// Fixed GET function in /api/chats/route.js with auto-delete
export async function GET(request) {
  try {
    await connectDB();

    // AUTO-DELETE: Clean up old chats before fetching
    await autoDeleteOldChats();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 1000;
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page')) || 1;
    const offset = (page - 1) * limit;

    console.log('Retrieving chat list:', { limit, sessionId, userId, page });

    // userId is required for fetching chats
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Build query - always filter by userId and only get active chats
    const query = {
      isActive: true,
      userId: userId // Filter chats by userId
    };

    // Optionally filter by sessionId as well
    if (sessionId) {
      query.sessionId = sessionId;
    }

    // Get total count for pagination
    const totalCount = await Chat.countDocuments(query);

    // Get chats with proper message count using aggregation
    const chats = await Chat.aggregate([
      { $match: query },
      {
        $addFields: {
          messageCount: { $size: "$messages" }, // Get actual message count
          lastMessage: { $arrayElemAt: ["$messages", -1] }, // Get last message
          daysOld: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24 // Convert milliseconds to days
            ]
          }
        }
      },
      {
        $project: {
          chatId: 1,
          title: 1,
          userId: 1,
          sessionId: 1,
          tradeDataSummary: 1,
          createdAt: 1,
          updatedAt: 1,
          messageCount: 1, // Include the calculated count
          lastMessage: 1, // Include the last message
          daysOld: { $round: ["$daysOld", 1] } // Round to 1 decimal place
        }
      },
      { $sort: { updatedAt: -1 } },
      { $skip: offset },
      { $limit: limit }
    ]);

    // Format for frontend sidebar
    const formattedChats = chats.map(chat => {
      const messageCount = chat.messageCount || 0; // Use the calculated count
      const lastMessage = chat.lastMessage;
      const preview = lastMessage ?
        (lastMessage.content.length > 60 ?
          lastMessage.content.substring(0, 60) + '...' :
          lastMessage.content) :
        'No messages yet';

      return {
        chatId: chat.chatId,
        title: chat.title,
        userId: chat.userId,
        sessionId: chat.sessionId,
        preview,
        messageCount, // Now this will be the correct count
        lastMessageType: lastMessage?.role || 'user',
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        tradeDataSummary: chat.tradeDataSummary,
        daysOld: chat.daysOld, // Include age for debugging/info
        expiresIn: Math.max(0, 30 - Math.ceil(chat.daysOld)) // Days until auto-delete
      };
    });

    console.log(`Retrieved ${formattedChats.length} chats for user ${userId}`);

    return NextResponse.json({
      success: true,
      chats: formattedChats,
      pagination: {
        total: totalCount,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      },
      autoDeleteInfo: {
        enabled: true,
        retentionDays: 30,
        message: "Chats older than 30 days are automatically deleted"
      }
    });

  } catch (error) {
    console.error('Error retrieving chat list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve chats', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Create new chat with userId
export async function POST(request) {
  try {
    await connectDB();

    const { chatId, title, sessionId, userId, tradeDataSummary } = await request.json();

    // sessionId is now optional
    if (!chatId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: chatId and userId' },
        { status: 400 }
      );
    }

    const existingChat = await Chat.findOne({ chatId });
    if (existingChat) {
      return NextResponse.json(
        { success: false, error: 'Chat already exists' },
        { status: 409 }
      );
    }

    const chat = new Chat({
      chatId,
      title: title || 'New Chat',
      userId,
      sessionId: sessionId || null, // Optional
      messages: [],
      tradeDataSummary: tradeDataSummary || {}
    });

    await chat.save();

    console.log('Created new chat:', chat.title, 'for user:', userId);

    return NextResponse.json({
      success: true,
      chat: {
        chatId: chat.chatId,
        title: chat.title,
        userId: chat.userId,
        sessionId: chat.sessionId,
        createdAt: chat.createdAt,
        expiresAt: new Date(chat.createdAt.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days from creation
      }
    });

  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create chat', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete all chats for a user (optional bulk operation)
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const chatId = searchParams.get('chatId');
    const force = searchParams.get('force') === 'true'; // For manual cleanup

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    let result;
    if (chatId) {
      // Delete specific chat for user
      result = await Chat.findOneAndUpdate(
        { chatId, userId },
        {
          isActive: false,
          deletedAt: new Date(),
          deletedBy: force ? 'admin' : 'user'
        },
        { new: true }
      );
    } else {
      // Soft delete all chats for user
      result = await Chat.updateMany(
        { userId, isActive: true },
        {
          isActive: false,
          deletedAt: new Date(),
          deletedBy: force ? 'admin' : 'user'
        }
      );
    }

    console.log(`Deleted chats for user ${userId}:`, result);

    return NextResponse.json({
      success: true,
      message: chatId ? 'Chat deleted successfully' : 'All chats deleted successfully',
      result
    });

  } catch (error) {
    console.error('Error deleting chats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete chats', details: error.message },
      { status: 500 }
    );
  }
}

// NEW: Manual cleanup endpoint for admin/cron jobs
export async function PATCH(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const days = parseInt(searchParams.get('days')) || 30;

    if (action === 'cleanup') {
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() - days);

      const result = await Chat.updateMany(
        {
          createdAt: { $lt: deletionDate },
          isActive: true
        },
        {
          isActive: false,
          autoDeletedAt: new Date(),
          deletedBy: 'auto-cleanup'
        }
      );

      console.log(`Manual cleanup: deleted ${result.modifiedCount} chats older than ${days} days`);

      return NextResponse.json({
        success: true,
        message: `Cleaned up ${result.modifiedCount} chats older than ${days} days`,
        deletedCount: result.modifiedCount,
        cutoffDate: deletionDate
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use ?action=cleanup' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error during manual cleanup:', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup failed', details: error.message },
      { status: 500 }
    );
  }
}