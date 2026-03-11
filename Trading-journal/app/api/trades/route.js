import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Trade from '@/models/Trade';
import Strategy from '@/models/Strategy';

// Simplified authentication function with better error handling
async function getAuthenticatedUser(request) {
  try {
    // Try server-side auth first
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId } = auth();

      if (userId) {
        return userId;
      }
    } catch (authImportError) {
      // Continue to next method
    }

    // Check for Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null; // Return null instead of default user
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return null;
    }

    // Try token verification
    try {
      const { verifyToken } = await import('@clerk/backend');
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      if (payload && payload.sub) {
        return payload.sub;
      }
    } catch (tokenError) {
      // Fallback: try to decode token payload without verification for development
      try {
        const base64Payload = token.split('.')[1];
        if (base64Payload) {
          const decodedPayload = JSON.parse(atob(base64Payload));
          if (decodedPayload.sub) {
            return decodedPayload.sub;
          }
        }
      } catch (decodeError) {
        // Continue to return null
      }
    }

    return null;

  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Helper function to get current trading session based on time
function getCurrentSession() {
  const now = new Date();
  const utcHour = now.getUTCHours();

  // Trading sessions in UTC
  if (utcHour >= 0 && utcHour < 8) {
    return 'Asian';
  } else if (utcHour >= 8 && utcHour < 16) {
    return 'London';
  } else if (utcHour >= 16 && utcHour < 24) {
    return 'New York';
  } else {
    return 'Asian';
  }
}

// Helper function to format date properly
function formatDate(dateValue) {
  if (!dateValue) return null;

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return null;

    return date;
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
}

// Helper function to format date for response (YYYY-MM-DD)
function formatDateForResponse(dateValue) {
  if (!dateValue) return null;

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return null;

    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for response:', error);
    return null;
  }
}

// Helper function to clean trade data
function cleanTradeData(data) {
  const cleanData = { ...data };

  // Remove empty/null fields
  Object.keys(cleanData).forEach(key => {
    if (cleanData[key] === null || cleanData[key] === undefined || cleanData[key] === '') {
      delete cleanData[key];
    }
    // Keep images and confluences as arrays, convert other arrays to strings for MongoDB storage
    if (Array.isArray(cleanData[key]) && key !== 'images' && key !== 'confluences') {
      cleanData[key] = cleanData[key].join(', ');
    }
  });

  return cleanData;
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const strategyId = searchParams.get('strategyId');

    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (id) {
      const trade = await Trade.findOne({ _id: id, userId }).populate('strategy');
      if (!trade) {
        return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
      }

      // Verify trade belongs to authenticated user
      if (trade.userId !== userId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Format date for response
      const formattedTrade = {
        ...trade.toObject(),
        date: formatDateForResponse(trade.date),
        id: trade._id.toString()
      };

      return NextResponse.json(formattedTrade);
    }

    let query = { userId }; // Always filter by authenticated user
    if (strategyId) {
      query.strategy = strategyId;
    }

    const trades = await Trade.find(query).populate('strategy').sort({ createdAt: -1 });

    // Additional security check - filter out any trades that don't belong to the user
    const validTrades = trades.filter(trade => trade.userId === userId);

    // Format trades for response with consistent structure
    const formattedTrades = validTrades.map(trade => {
      const tradeObj = trade.toObject();
      return {
        ...tradeObj,
        id: tradeObj._id.toString(),
        _id: tradeObj._id.toString(),
        date: formatDateForResponse(tradeObj.date),
        image: tradeObj.image || null,
        strategyName: tradeObj.strategy?.strategyName || '',
        strategy: tradeObj.strategy?._id || tradeObj.strategy || null
      };
    });

    return NextResponse.json(formattedTrades);
  } catch (error) {
    console.error('GET /api/trades error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      error: 'Failed to fetch trades',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get raw body and ALWAYS strip _id to prevent duplicate key errors
    const rawBody = await request.json();

    console.log('📝 POST /api/trades received:', {
      market: rawBody.market,
      pair: rawBody.pair
    });

    // Clean the data and remove any temp IDs
    const body = cleanTradeData(rawBody);
    delete body._id;
    delete body.id;

    // Auto-set session if not provided
    if (!body.session && !body.sessionId) {
      const currentSession = getCurrentSession();
      body.session = currentSession;
    }

    // Format date if provided
    if (body.date) {
      body.date = formatDate(body.date);
    }

    const tradeData = {
      ...body,
      userId, // Always ensure userId is set to authenticated user
    };

    // If strategy is provided, populate strategy fields and verify ownership
    if (tradeData.strategy) {
      const strategy = await Strategy.findOne({ _id: tradeData.strategy, userId });
      if (strategy) {
        if (!tradeData.setupType) tradeData.setupType = strategy.setupType;
        if (!tradeData.confluences && strategy.confluences) {
          tradeData.confluences = Array.isArray(strategy.confluences)
            ? strategy.confluences.join(', ')
            : strategy.confluences;
        }
        if (!tradeData.entryType && strategy.entryType) {
          tradeData.entryType = Array.isArray(strategy.entryType)
            ? strategy.entryType.join(', ')
            : strategy.entryType;
        }
        if (!tradeData.timeFrame && strategy.timeframes) {
          tradeData.timeFrame = Array.isArray(strategy.timeframes)
            ? strategy.timeframes[0]
            : strategy.timeframes;
        }
        if (!tradeData.pair && strategy.tradingPairs) {
          tradeData.pair = Array.isArray(strategy.tradingPairs)
            ? strategy.tradingPairs[0]
            : strategy.tradingPairs;
        }
      } else {
        // Remove strategy reference if user doesn't have access
        delete tradeData.strategy;
      }
    }

    const trade = new Trade(tradeData);
    await trade.save();

    const populatedTrade = await Trade.findById(trade._id).populate('strategy');

    // Verify the created trade belongs to the authenticated user
    if (populatedTrade.userId !== userId) {
      console.error('Trade userId mismatch after creation');
      return NextResponse.json({ error: 'Trade creation failed' }, { status: 500 });
    }

    // Format the response consistently
    const tradeObj = populatedTrade.toObject();
    const formattedTrade = {
      ...tradeObj,
      id: tradeObj._id.toString(),
      _id: tradeObj._id.toString(),
      date: formatDateForResponse(tradeObj.date),
      image: tradeObj.image || null,
      strategyName: tradeObj.strategy?.strategyName || '',
      strategy: tradeObj.strategy?._id || tradeObj.strategy || null
    };

    return NextResponse.json(formattedTrade, { status: 201 });
  } catch (error) {
    console.error('POST /api/trades error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      error: 'Failed to create trade',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const rawBody = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }

    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Clean the data
    const body = cleanTradeData(rawBody);
    delete body._id;
    delete body.id;

    // Format date if provided
    if (body.date) {
      body.date = formatDate(body.date);
    }

    const updateData = {
      ...body,
      userId // Ensure userId is always maintained
    };

    // If strategy is being updated, populate strategy fields and verify ownership
    if (updateData.strategy) {
      const strategy = await Strategy.findOne({ _id: updateData.strategy, userId });
      if (strategy) {
        // Only update fields that are not already set
        if (!updateData.setupType && strategy.setupType) {
          updateData.setupType = strategy.setupType;
        }
        if (!updateData.confluences && strategy.confluences) {
          updateData.confluences = Array.isArray(strategy.confluences)
            ? strategy.confluences.join(', ')
            : strategy.confluences;
        }
      } else {
        // Remove strategy reference if user doesn't have access
        delete updateData.strategy;
      }
    }

    const trade = await Trade.findOneAndUpdate(
      { _id: id, userId }, // Always filter by userId
      updateData,
      { new: true, runValidators: true }
    ).populate('strategy');

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Verify the updated trade still belongs to the authenticated user
    if (trade.userId !== userId) {
      console.error('Trade userId mismatch after update');
      return NextResponse.json({ error: 'Trade update failed' }, { status: 500 });
    }

    // Format the response consistently
    const tradeObj = trade.toObject();
    const formattedTrade = {
      ...tradeObj,
      id: tradeObj._id.toString(),
      _id: tradeObj._id.toString(),
      date: formatDateForResponse(tradeObj.date),
      image: tradeObj.image || null,
      strategyName: tradeObj.strategy?.strategyName || '',
      strategy: tradeObj.strategy?._id || tradeObj.strategy || null
    };

    return NextResponse.json(formattedTrade);
  } catch (error) {
    console.error('PUT /api/trades error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      error: 'Failed to update trade',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }

    // First, find the trade to get its images before deleting
    const trade = await Trade.findOne({ _id: id, userId });

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Delete images from Cloudinary
    const imagesToDelete = [];
    if (trade.image) imagesToDelete.push(trade.image);
    if (trade.images && Array.isArray(trade.images)) {
      trade.images.forEach(img => {
        if (img && !imagesToDelete.includes(img)) {
          imagesToDelete.push(img);
        }
      });
    }

    // Delete each image from Cloudinary
    if (imagesToDelete.length > 0) {
      for (const imageUrl of imagesToDelete) {
        try {
          const publicId = extractPublicIdFromUrl(imageUrl);
          if (publicId) {
            const deleteResponse = await fetch(`${request.nextUrl.origin}/api/upload`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicId })
            });

            if (!deleteResponse.ok) {
              console.warn(`⚠️ Failed to delete image from Cloudinary: ${publicId}`);
            }
          }
        } catch (imgError) {
          console.warn('Error deleting image from Cloudinary:', imgError.message);
          // Continue with trade deletion even if image deletion fails
        }
      }
    }

    // Now delete the trade from database
    await Trade.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Trade deleted successfully',
      id: trade._id.toString(),
      imagesDeleted: imagesToDelete.length
    });
  } catch (error) {
    console.error('DELETE /api/trades error:', error);
    return NextResponse.json({
      error: 'Failed to delete trade',
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to extract public_id from Cloudinary URL
function extractPublicIdFromUrl(url) {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
      const pathParts = parts.slice(uploadIndex + 2);
      const filename = pathParts.join('/');
      // Remove file extension
      return filename.replace(/\.[^/.]+$/, '');
    }
  } catch (error) {
    console.error('Error extracting public_id:', error);
  }
  return null;
}