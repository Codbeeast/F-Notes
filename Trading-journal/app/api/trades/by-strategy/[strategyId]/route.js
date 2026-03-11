import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Trade from '@/models/Trade';
import Strategy from '@/models/Strategy';

// Simplified authentication function with better error handling
async function getAuthenticatedUser(request) {
  try {
    console.log('Starting authentication...');
    
    // Try server-side auth first
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId } = auth();
      
      if (userId) {
        console.log('Server-side auth successful:', userId);
        return userId;
      }
      console.log('No server-side userId, trying client auth...');
    } catch (authImportError) {
      console.log('Server-side auth failed:', authImportError.message);
    }

    // Check for Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header found');
      return null; // Changed from DEFAULT_USER_ID to null
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('Empty token');
      return null; // Changed from DEFAULT_USER_ID to null
    }

    // Try token verification
    try {
      const { verifyToken } = await import('@clerk/backend');
      const payload = await verifyToken(token, {
        jwtKey: process.env.CLERK_JWT_KEY,
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      
      if (payload && payload.sub) {
        console.log('Token verification successful:', payload.sub);
        return payload.sub;
      }
    } catch (tokenError) {
      console.log('Token verification failed:', tokenError.message);
    }

    console.log('All auth methods failed');
    return null; // Changed from DEFAULT_USER_ID to null
    
  } catch (error) {
    console.error('Authentication error:', error);
    return null; // Changed from DEFAULT_USER_ID to null
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

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export async function GET(request, { params }) {
  console.log('GET /api/trades/by-strategy/[strategyId] called');
  
  try {
    await connectDB();
    console.log('Database connected');
    
    const { strategyId } = params;
    
    if (!strategyId) {
      console.log('Strategy ID is required');
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    // Validate MongoDB ObjectId format
    if (!isValidObjectId(strategyId)) {
      console.log('Invalid strategy ID format:', strategyId);
      return NextResponse.json({ error: 'Invalid strategy ID format' }, { status: 400 });
    }
    
    console.log('Strategy ID:', strategyId);
    
    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      console.log('No authenticated user found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.log('Using userId:', userId);

    // First, verify the strategy exists and belongs to the user
    try {
      const strategy = await Strategy.findOne({ _id: strategyId, userId });
      if (!strategy) {
        console.log('Strategy not found or access denied');
        return NextResponse.json({ error: 'Strategy not found or access denied' }, { status: 404 });
      }
      console.log('Strategy found:', strategy.strategyName);
    } catch (strategyError) {
      console.error('Error finding strategy:', strategyError);
      return NextResponse.json({ error: 'Invalid strategy ID' }, { status: 400 });
    }
    
    const query = {
      userId,
      strategy: strategyId
    };
    
    console.log('Fetching trades with query:', query);
    
    try {
      const trades = await Trade.find(query)
        .populate('strategy')
        .sort({ createdAt: -1 });
      
      console.log(`Found ${trades.length} trades for strategy ${strategyId}`);
      
      // Only return trades that actually belong to the authenticated user
      const validTrades = trades.filter(trade => 
        trade.userId === userId && trade.strategy && trade.strategy._id.toString() === strategyId
      );
      
      console.log(`Valid trades after filtering: ${validTrades.length}`);
      
      // Format trades for frontend consumption with consistent structure
      const formattedTrades = validTrades.map(trade => {
        const tradeObj = trade.toObject();
        return {
          ...tradeObj,
          id: tradeObj._id.toString(),
          _id: tradeObj._id.toString(),
          date: formatDateForResponse(tradeObj.date),
          image: tradeObj.image || null,
          strategyName: tradeObj.strategy?.strategyName || '',
          strategy: tradeObj.strategy?._id || tradeObj.strategy || null,
          sessionName: tradeObj.session || ''
        };
      });
      
      return NextResponse.json(formattedTrades);
    } catch (tradeError) {
      console.error('Error fetching trades:', tradeError);
      return NextResponse.json({ 
        error: 'Failed to fetch trades', 
        details: tradeError.message 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('GET /api/trades/by-strategy/[strategyId] error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      error: 'Failed to fetch trades by strategy',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  console.log('POST /api/trades/by-strategy/[strategyId] called');
  
  try {
    await connectDB();
    console.log('Database connected');

    const { strategyId } = params;
    
    if (!strategyId) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }

    // Validate MongoDB ObjectId format
    if (!isValidObjectId(strategyId)) {
      return NextResponse.json({ error: 'Invalid strategy ID format' }, { status: 400 });
    }

    // Get authenticated user
    const userId = await getAuthenticatedUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.log('Using userId:', userId);

    // Verify the strategy exists and belongs to the user
    const strategy = await Strategy.findOne({ _id: strategyId, userId });
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found or access denied' }, { status: 404 });
    }

    // Get request body
    const rawBody = await request.json();
    console.log('Raw body received:', Object.keys(rawBody));
    
    // Clean the data and remove any temp IDs
    const body = { ...rawBody };
    delete body._id;
    delete body.id;

    // Format date if provided
    if (body.date) {
      const date = new Date(body.date);
      if (!isNaN(date.getTime())) {
        body.date = date;
      }
    }

    const tradeData = {
      ...body,
      userId, // Ensure userId is always set
      strategy: strategyId
    };

    // Auto-populate strategy fields
    console.log('Auto-populating strategy fields from:', strategy.strategyName);
    if (!tradeData.setupType && strategy.setupType) {
      tradeData.setupType = strategy.setupType;
    }
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
    if (!tradeData.risk && strategy.risk) {
      tradeData.risk = strategy.risk;
    }
    if (!tradeData.rFactor && strategy.rFactor) {
      tradeData.rFactor = strategy.rFactor;
    }

    console.log('Final trade data keys:', Object.keys(tradeData));

    const trade = new Trade(tradeData);
    await trade.save();
    console.log('Trade saved with ID:', trade._id);

    const populatedTrade = await Trade.findById(trade._id).populate('strategy');
    console.log('Trade populated and ready to return');
    
    // Verify the trade actually belongs to the authenticated user before returning
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
    console.error('POST /api/trades/by-strategy/[strategyId] error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to create trade for strategy',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}