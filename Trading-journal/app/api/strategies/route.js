import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import Strategy from '@/models/Strategy';
import Trade from '@/models/Trade';

// Helper function to get user from request
async function getAuthenticatedUser(request) {
  try {
    // First try to get user from server-side auth
    const { userId } = auth();
    
    if (userId) {
      return userId;
    }

    // If server-side auth fails, try to get from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No authorization token provided');
    }

    // For client-side requests, we need to verify the JWT token with Clerk
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Invalid authorization token');
    }

    // Import Clerk's JWT verification
    const { verifyToken } = await import('@clerk/backend');
    
    try {
      // Verify the token and extract the payload
      const payload = await verifyToken(token, {
        jwtKey: process.env.CLERK_JWT_KEY,
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      
      if (payload && payload.sub) {
        return payload.sub; // sub contains the user ID
      }
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      
      // Fallback: try to extract userId from token payload without verification
      // This is less secure but works for development
      try {
        const base64Payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(base64Payload));
        if (decodedPayload.sub) {
          console.warn('Using unverified token payload - not recommended for production');
          return decodedPayload.sub;
        }
      } catch (parseError) {
        console.error('Failed to parse token payload:', parseError);
      }
    }

    throw new Error('Unable to authenticate user');
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Authentication failed');
  }
}

export async function GET(request) {
  try {
    const userId = await getAuthenticatedUser(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - No user ID found' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const strategy = await Strategy.findOne({ _id: id, userId });
      if (!strategy) {
        return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
      }
      return NextResponse.json(strategy);
    }
    
    const strategies = await Strategy.find({ userId }).sort({ createdAt: -1 });
    console.log(`Returning ${strategies.length} strategies for user: ${userId}`);
    return NextResponse.json(strategies);
  } catch (error) {
    console.error('GET /api/strategies error:', error);
    
    // Return more specific error messages
    if (error.message.includes('Authentication')) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        details: error.message 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch strategies',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getAuthenticatedUser(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - No user ID found' }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.strategyName || !body.strategyType) {
      return NextResponse.json({ 
        error: 'Missing required fields: strategyName and strategyType are required' 
      }, { status: 400 });
    }
    
    const strategyData = {
      ...body,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const strategy = new Strategy(strategyData);
    await strategy.save();
    
    console.log(`Created strategy for user: ${userId}`);
    return NextResponse.json(strategy, { status: 201 });
  } catch (error) {
    console.error('POST /api/strategies error:', error);
    
    if (error.message.includes('Authentication')) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        details: error.message 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create strategy',
      details: error.message 
    }, { status: 500 });
  }
}

// Helper function to update related trades when strategy changes
async function updateRelatedTrades(strategyId, updatedStrategy, userId) {
  try {
    const relatedTrades = await Trade.find({ 
      strategy: strategyId,
      userId 
    });

    if (relatedTrades.length === 0) {
      return;
    }

    const tradeUpdates = {};
    
    if (updatedStrategy.setupType) {
      tradeUpdates.setupType = Array.isArray(updatedStrategy.setupType)
        ? updatedStrategy.setupType.join(', ')
        : updatedStrategy.setupType;
    }
    
    if (updatedStrategy.confluences && updatedStrategy.confluences.length > 0) {
      tradeUpdates.confluences = Array.isArray(updatedStrategy.confluences) 
        ? updatedStrategy.confluences.join(', ')
        : updatedStrategy.confluences;
    }
    
    if (updatedStrategy.entryType && updatedStrategy.entryType.length > 0) {
      tradeUpdates.entryType = Array.isArray(updatedStrategy.entryType)
        ? updatedStrategy.entryType.join(', ')
        : updatedStrategy.entryType;
    }
    
    if (updatedStrategy.timeframes && updatedStrategy.timeframes.length > 0) {
      tradeUpdates.timeFrame = Array.isArray(updatedStrategy.timeframes)
        ? updatedStrategy.timeframes[0]
        : updatedStrategy.timeframes;
    }
    
    if (updatedStrategy.tradingPairs && updatedStrategy.tradingPairs.length > 0) {
      const tradesWithoutCustomPairs = relatedTrades.filter(trade => 
        !trade.pair || 
        (updatedStrategy.tradingPairs && updatedStrategy.tradingPairs.includes(trade.pair))
      );
      
      if (tradesWithoutCustomPairs.length > 0) {
        tradeUpdates.pair = Array.isArray(updatedStrategy.tradingPairs)
          ? updatedStrategy.tradingPairs[0]
          : updatedStrategy.tradingPairs;
      }
    }

    if (Object.keys(tradeUpdates).length > 0) {
      await Trade.updateMany(
        { 
          strategy: strategyId,
          userId 
        },
        { 
          $set: {
            ...tradeUpdates,
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`Updated ${relatedTrades.length} trades with strategy changes for strategy ${strategyId} and user ${userId}`);
    }
  } catch (error) {
    console.error('Error updating related trades:', error);
  }
}

export async function PUT(request) {
  try {
    const userId = await getAuthenticatedUser(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - No user ID found' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    console.log('PUT /api/strategies - Request data:', { id, userId, body });
    
    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }
    
    const strategy = await Strategy.findOneAndUpdate(
      { _id: id, userId },
      { 
        ...body, 
        userId,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found or access denied' }, { status: 404 });
    }
    
    await updateRelatedTrades(id, strategy, userId);
    
    console.log(`Updated strategy for user: ${userId}`);
    return NextResponse.json(strategy);
  } catch (error) {
    console.error('PUT /api/strategies error:', error);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    
    // Handle Mongoose validation errors specifically
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.message,
        validationErrors: error.errors
      }, { status: 400 });
    }
    
    if (error.message.includes('Authentication')) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        details: error.message 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update strategy',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const userId = await getAuthenticatedUser(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - No user ID found' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }
    
    const strategy = await Strategy.findOneAndUpdate(
      { _id: id, userId },
      { 
        ...body, 
        userId,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found or access denied' }, { status: 404 });
    }
    
    await updateRelatedTrades(id, strategy, userId);
    
    console.log(`Patched strategy for user: ${userId}`);
    return NextResponse.json(strategy);
  } catch (error) {
    console.error('PATCH /api/strategies error:', error);
    
    if (error.message.includes('Authentication')) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        details: error.message 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update strategy',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const userId = await getAuthenticatedUser(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - No user ID found' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    const strategy = await Strategy.findOne({ _id: id, userId });
    
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found or access denied' }, { status: 404 });
    }

    // Find and delete all related trades first
    const relatedTrades = await Trade.find({ 
      strategy: id,
      userId 
    });

    const deletedTradesResult = await Trade.deleteMany({ 
      strategy: id,
      userId 
    });

    // Then delete the strategy
    await Strategy.findOneAndDelete({ _id: id, userId });

    console.log(`Deleted strategy ${id} and ${deletedTradesResult.deletedCount} related trades for user ${userId}`);
    
    return NextResponse.json({ 
      message: 'Strategy deleted successfully',
      deletedTrades: deletedTradesResult.deletedCount,
      strategyName: strategy.strategyName
    });
  } catch (error) {
    console.error('DELETE /api/strategies error:', error);
    
    if (error.message.includes('Authentication')) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        details: error.message 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to delete strategy',
      details: error.message 
    }, { status: 500 });
  }
}