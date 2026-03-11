import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Chat from '@/models/Chat';
import ChatLimit from '@/models/ChatLimit';
import Subscription from '@/models/Subscription';
import { DEFAULT_PLANS } from '@/lib/plans-config';
// 👇 NEW 2025 SDK
import { GoogleGenAI } from "@google/genai";

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxCallsPerDay: 45, // Buffer from the 50 limit
  resetHour: 0,       // Reset at midnight
  retryDelay: 25000,  // 25 seconds
};

// In-memory rate limit tracking (Use Redis in production)
let dailyApiCalls = {
  count: 0,
  date: new Date().toDateString(),
  lastReset: new Date()
};

// --- PERSONA LOGIC ---

const getRandomPersona = () => {
  const personas = [
    {
      name: "The Pro Mentor",
      personality: `You are TradeBot AI. PROFESSIONAL MODE.
STYLE: Helpful, analytical, and encouraging.
RULES:
- Be concise but detailed enough to add value.
- Use bullet points for clarity.
- Focus on patterns and actionable advice.`,
    },
    {
      name: "The Data Analyst",
      personality: `You are TradeBot AI. ANALYTICAL MODE.
STYLE: Data-driven, objective, precise.
RULES:
- Focus on the metrics (Win Rate, R-Factor).
- Explain *why* a trade might have worked or failed based on the data.
- Keep it professional.`,
    },
    {
      name: "The Trading Coach",
      personality: `You are TradeBot AI. COACH MODE.
STYLE: Supportive, wise, experienced.
RULES:
- Encourage good habits (following rules).
- Gently point out mistakes (fomo, revenge trading).
- Remind the user of their long-term goals.`,
    }
  ];

  return personas[Math.floor(Math.random() * personas.length)];
};

// Fallback response generator
function generateFallbackResponse(context, data) {
  const responses = [
    "System glitch. Check your risk while I reboot.",
    "My brain froze faster than a bad trade. Try again.",
    "Data overload. Give me a second.",
    `I see ${data?.portfolio?.totalTrades || 0} trades but can't analyze them right now.`,
    "Technical foul. Retry in a moment."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// --- HELPER FUNCTIONS ---

// Rate limit check
function checkRateLimit() {
  const today = new Date().toDateString();

  // Reset counter if it's a new day
  if (dailyApiCalls.date !== today) {
    dailyApiCalls = {
      count: 0,
      date: today,
      lastReset: new Date()
    };
    console.log('Daily API call counter reset for new day');
  }

  // Check if we're at the limit
  if (dailyApiCalls.count >= RATE_LIMIT_CONFIG.maxCallsPerDay) {
    const hoursUntilReset = 24 - new Date().getHours();
    throw new Error(`Daily FoNo API limit reached (${dailyApiCalls.count}/${RATE_LIMIT_CONFIG.maxCallsPerDay}). Resets in ${hoursUntilReset} hours.`);
  }

  return true;
}

function incrementApiCallCount() {
  dailyApiCalls.count++;
  console.log(`API calls today: ${dailyApiCalls.count}/${RATE_LIMIT_CONFIG.maxCallsPerDay}`);
}

// Monthly Limit Check
async function checkMonthlyLimit(userId, username = 'Unknown', email = '') {
  if (!userId) return { allowed: false, error: 'User ID required' };

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Default limit
  let NEW_MONTHLY_LIMIT = 60;

  // --- DYNAMIC LIMIT CHECK ---
  try {
    const activeSub = await Subscription.findActiveSubscription(userId);
    if (activeSub) {
      const plan = DEFAULT_PLANS.find(p => p.planId === activeSub.planType);
      if (plan && plan.credits) {
        NEW_MONTHLY_LIMIT = plan.credits;
        console.log(`[Limit Check] User ${userId} has active plan ${activeSub.planType} with ${NEW_MONTHLY_LIMIT} credits`);
      }
    }
  } catch (err) {
    console.error('[Limit Check] Error fetching subscription:', err);
  }

  let limitDoc = await ChatLimit.findOne({ userId });

  if (!limitDoc) {
    limitDoc = await ChatLimit.create({
      userId,
      username,
      email,
      currentMonth: currentMonthStr,
      promptsUsed: 0,
      monthlyLimit: NEW_MONTHLY_LIMIT // Use plan-based limit
    });
  }

  // AUTO-MIGRATION/SYNC: Update user limit to match their plan
  if (limitDoc.monthlyLimit !== NEW_MONTHLY_LIMIT) {
    console.log(`[Limit Check] Updating user ${userId} limit from ${limitDoc.monthlyLimit} to ${NEW_MONTHLY_LIMIT}`);
    limitDoc.monthlyLimit = NEW_MONTHLY_LIMIT;
    await limitDoc.save();
  }

  // Check for month reset
  if (limitDoc.currentMonth !== currentMonthStr) {
    limitDoc.currentMonth = currentMonthStr;
    limitDoc.promptsUsed = 0;
    limitDoc.lastResetDate = now;
    await limitDoc.save();
    console.log(`Monthly limit reset for user ${userId} to ${currentMonthStr}`);
  }

  // Check limit
  console.log(`[Limit Check] User: ${userId} | Used: ${limitDoc.promptsUsed} | Limit: ${limitDoc.monthlyLimit}`);

  if (limitDoc.promptsUsed >= limitDoc.monthlyLimit) {
    // Calculate when the next reset is (1st of next month)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return {
      allowed: false,
      error: `You have used all ${limitDoc.monthlyLimit} credits for this month. Your credits will verify replenish on ${nextMonth.toDateString()} at 12:00 AM.`,
      limit: limitDoc.monthlyLimit,
      used: limitDoc.promptsUsed
    };
  }

  return {
    allowed: true,
    limit: limitDoc.monthlyLimit,
    used: limitDoc.promptsUsed,
    doc: limitDoc
  };
}

// Format trade data
function formatTradeData(tradeData) {
  // console.log('Raw trade data received:', JSON.stringify(tradeData, null, 2));

  if (!tradeData || !tradeData.trades || !Array.isArray(tradeData.trades)) {
    console.error('Invalid trade data structure:', tradeData);
    throw new Error('Invalid trade data structure - trades array is missing or invalid');
  }

  const portfolio = tradeData.portfolio || {};
  const strategies = tradeData.strategies || [];
  const trades = tradeData.trades || [];

  // Format each trade
  const formattedTrades = trades.map((trade, index) => {
    try {
      let tradeDate = 'Unknown Date';
      let tradeTime = trade.time || 'Unknown Time';

      if (trade.date) {
        const date = new Date(trade.date);
        if (!isNaN(date.getTime())) {
          tradeDate = date.toLocaleDateString('en-US');
        }
      } else if (trade.createdAt) {
        const date = new Date(trade.createdAt);
        if (!isNaN(date.getTime())) {
          tradeDate = date.toLocaleDateString('en-US');
        }
      }

      const symbol = trade.pair || trade.symbol || 'Unknown';
      const type = trade.positionType || trade.type || 'Unknown';
      const pnl = trade.pnl ? parseFloat(trade.pnl).toFixed(2) : '0.00';
      const session = trade.session || 'Unknown';
      const strategyName = trade.strategyName || 'Unknown'; // Helper function should pass this if flattened, or trade.strategy?.strategyName
      const setupType = trade.setupType || 'Unknown';
      const timeFrame = trade.timeFrame || 'Unknown';
      const rFactor = trade.rFactor ? parseFloat(trade.rFactor).toFixed(2) : '0.00';
      const notes = trade.notes || '';
      const confluences = Array.isArray(trade.confluences) && trade.confluences.length > 0
        ? trade.confluences.join(', ')
        : 'None recorded';
      const rulesFollowed = trade.rulesFollowed !== undefined
        ? (trade.rulesFollowed ? 'Yes' : 'No')
        : 'Unknown';

      return {
        index: index + 1,
        date: tradeDate,
        time: tradeTime,
        symbol,
        type,
        pnl,
        session,
        strategyName,
        formatted: `Trade #${index + 1}: ${symbol} ${type} | ${tradeDate} | Time: ${tradeTime} | P&L: $${pnl} (R: ${rFactor}) | Strategy: ${strategyName} | Session: ${session} | News: ${trade.news || 'None'} (${trade.affectedByNews || 'N/A'}) | Setup: ${setupType} | Confluences: ${confluences} | Rules: ${rulesFollowed} | Notes: "${notes}"`
      };
    } catch (error) {
      return {
        index: index + 1,
        formatted: `#${index + 1}: Error formatting trade data`
      };
    }
  });

  // Calculate Session Performance
  const sessionStats = {};
  trades.forEach(t => {
    const sName = t.session || 'Unknown';
    if (!sessionStats[sName]) {
      sessionStats[sName] = { name: sName, trades: 0, pnl: 0 };
    }
    sessionStats[sName].trades += 1;
    sessionStats[sName].pnl += (parseFloat(t.pnl) || 0);
  });
  const sessions = Object.values(sessionStats);

  // Calculate Hourly Performance
  const hourlyStats = {};
  trades.forEach(t => {
    // Parse time (expecting HH:MM)
    if (t.time && typeof t.time === 'string' && t.time.includes(':')) {
      const hour = t.time.split(':')[0]; // Extract "14" from "14:30"
      const hourLabel = `${hour}:00 - ${hour}:59`;

      if (!hourlyStats[hourLabel]) {
        hourlyStats[hourLabel] = { name: hourLabel, trades: 0, pnl: 0, wins: 0 };
      }

      const pnlVal = parseFloat(t.pnl) || 0;
      hourlyStats[hourLabel].trades += 1;
      hourlyStats[hourLabel].pnl += pnlVal;
      if (pnlVal > 0) hourlyStats[hourLabel].wins += 1;
    }
  });

  // Convert to array and sort by hour (simple string sort works for 00-23)
  const hours = Object.values(hourlyStats).sort((a, b) => a.name.localeCompare(b.name));

  return {
    portfolio: {
      totalTrades: portfolio.totalTrades || trades.length,
      totalPnL: portfolio.totalPnL || trades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0),
      winRate: portfolio.winRate || (trades.filter(t => (parseFloat(t.pnl) || 0) > 0).length / Math.max(trades.length, 1)),
    },
    strategies: strategies.length > 0 ? strategies : [{
      name: 'Default Strategy',
      trades: trades.length,
      pnl: trades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0)
    }],
    sessions: sessions,
    hours: hours,
    trades: formattedTrades,
    activeFilter: tradeData.activeFilter || 'All Trades',
    rawTrades: trades
  };
}

// --- GEMINI API CALL ---

async function callGeminiAPI(conversationHistory, systemPrompt, userMessage) {
  try {
    console.log('Calling Fono API (Gemini 3 Pro)...');

    // 1. Check Limits
    checkRateLimit();

    // 2. Initialize Client
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 3. Prepare Contents
    let contents = [];
    if (conversationHistory && conversationHistory.length > 0) {
      contents = [...conversationHistory];
    }
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // 4. Time Context
    const timeContext = `Current Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`;

    // 5. Generate Content
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // 2025 Model
      contents: contents,
      config: {
        // System Prompt goes here in new SDK
        systemInstruction: {
          parts: [{ text: timeContext + "\n\n" + systemPrompt }]
        },
        // Thinking Config (Low = Faster/Crisper)
        thinkingConfig: {
          thinkingLevel: "low",
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        }
      }
    });

    incrementApiCallCount();

    // 6. Return Text
    // Note: In @google/genai, response.text is a getter property for the text string
    return response.text;

  } catch (error) {
    console.error('Fono API error:', error);
    throw error;
  }
}

// --- MAIN HANDLERS ---

async function syncData(tradeData, userId) {
  // Re-use sendMessage logic for consistency
  return await sendMessage('SYNC_INIT', tradeData, null, userId);
}

async function sendMessage(userMessage, tradeData, chatId, userId) {
  try {
    if (!tradeData) throw new Error('Trade data required');
    if (!userId) throw new Error('User ID required for chat operations');

    await connectDB();

    // CHECK MONTHLY LIMIT
    const limitCheck = await checkMonthlyLimit(userId);
    if (!limitCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: limitCheck.error,
        limitReached: true,
        chatLimit: {
          promptsUsed: limitCheck.used,
          promptsRemaining: 0,
          monthlyLimit: limitCheck.limit
        }
      }, { status: 429 });
    }

    const formattedData = formatTradeData(tradeData);
    const selectedPersona = getRandomPersona();

    // RECENT TRADES (Pass ALL active trades for Gemini 3 context)
    // We limit to 1000 just in case to avoid massive payloads, but 1000 is plenty for "All Data" context.
    const tradesContext = formattedData.trades.slice(0, 1000).map(t => t.formatted).join('\n');

    // FLEXIBLE SYSTEM PROMPT
    const systemPrompt = `You are TradeBot AI. 
    
PERSONALITY:
${selectedPersona.personality}

YOUR GOAL: Provide expert trading feedback that is helpful, insightful, and data-driven.

DATA CONTEXT:
- CURRENT VIEW: ${formattedData.activeFilter}
- FULL PORTFOLIO SUMMARY: ${formattedData.portfolio.totalTrades} trades, P&L: $${formattedData.portfolio.totalPnL.toFixed(2)}, Win Rate: ${(formattedData.portfolio.winRate * 100).toFixed(1)}%

STRATEGIES DEFINED:
${formattedData.strategies.map(s =>
      `- ${s.name}: ${s.trades} trades, $${parseFloat(s.pnl || 0).toFixed(0)}`
    ).join('\n')}


ALL TRADES LOG:
${tradesContext}

STRICT RULES:
1. ANSWER IMMEDIATELY. No filler.
2. Max 2-3 sentences.
3. USE THE DATA: You have the full trade log above. Verify your claims against it. Do NOT hallucinate trades that are not in the list.
4. If the user asks about a specific trade, look it up in the ALL TRADES LOG.
5. NO formatting quirks like markdown blocks unless necessary.

SESSIONS BREAKDOWN:
${formattedData.sessions.map(s =>
      `- ${s.name}: ${s.trades} trades, $${parseFloat(s.pnl || 0).toFixed(0)}`
    ).join('\n')}

HOURLY PERFORMANCE (Best Time to Trade):
${formattedData.hours.map(h =>
      `- ${h.name}: ${h.trades} trades, $${h.pnl.toFixed(0)} P&L, Win Rate: ${((h.wins / h.trades) * 100).toFixed(0)}%`
    ).join('\n')}

RECENT TRADES (History):
${formattedData.trades.slice(0, 100).map(t => t.formatted).join('\n')}

GUIDELINES:
1. Provide value directly. Avoid fluff, but don't be robotic.
2. If the user asks about specific trades, you have the data above.
3. You can use Markdown tables or lists if it helps organize the answer.
4. If the user is filtering by a strategy, focus on that, but keep the overall portfolio in mind.
5. Be natural and conversational.

`;

    // Fetch conversation history
    let conversationHistory = [];
    let chatDoc = null;

    if (chatId && userId) {
      chatDoc = await Chat.findOne({ chatId, userId, isActive: true });
      if (chatDoc && chatDoc.messages && chatDoc.messages.length > 0) {
        // Take last 10 messages (optimized for context window & speed)
        conversationHistory = chatDoc.messages.slice(-10).map(msg => ({
          role: msg.role === 'bot' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));
      }
    }

    const finalUserMessage = userMessage === 'SYNC_INIT' ? "Analyze my recent performance briefly." : userMessage;

    // Call Gemini
    const geminiResponseText = await callGeminiAPI(conversationHistory, systemPrompt, finalUserMessage);

    // Save to MongoDB
    if (chatDoc) {
      chatDoc.messages.push({ role: 'user', content: finalUserMessage, timestamp: new Date() });
      chatDoc.messages.push({ role: 'bot', content: geminiResponseText, timestamp: new Date() });
      await chatDoc.save();
    }

    // Increment Monthly Usage
    let updatedLimit = { promptsUsed: 0, monthlyLimit: 60 };
    if (limitCheck.doc) {
      limitCheck.doc.promptsUsed += 1;
      await limitCheck.doc.save();
      updatedLimit = {
        promptsUsed: limitCheck.doc.promptsUsed,
        monthlyLimit: limitCheck.doc.monthlyLimit
      };
    }

    return NextResponse.json({
      success: true,
      response: geminiResponseText,
      timestamp: new Date().toISOString(),
      apiLimitReached: false,
      rateLimit: {
        callsToday: dailyApiCalls.count,
        maxCalls: RATE_LIMIT_CONFIG.maxCallsPerDay,
        resetDate: dailyApiCalls.date
      },
      chatLimit: {
        promptsUsed: updatedLimit.promptsUsed,
        promptsRemaining: Math.max(0, updatedLimit.monthlyLimit - updatedLimit.promptsUsed),
        monthlyLimit: updatedLimit.monthlyLimit
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    // Return a safe fallback so the UI doesn't crash
    const fallback = generateFallbackResponse(null, tradeData);
    return NextResponse.json({
      success: true, // Return true to prevent UI crashes
      response: fallback,
      isFallback: true,
      error: error.message
    });
  }
}

// --- ROUTE HANDLER ---

export async function POST(request) {
  try {
    const jsonBody = await request.json();
    const { action, message, tradeData, chatId, userId } = jsonBody;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: 'API key missing' }, { status: 500 });
    }

    switch (action) {
      case 'sync':
        return await syncData(tradeData, userId);
      case 'sendMessage':
        return await sendMessage(message, tradeData, chatId, userId);
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  return NextResponse.json({
    status: 'healthy',
    rateLimit: {
      dailyCalls: dailyApiCalls.count,
      maxDailyCalls: RATE_LIMIT_CONFIG.maxCallsPerDay,
      callsRemaining: Math.max(0, RATE_LIMIT_CONFIG.maxCallsPerDay - dailyApiCalls.count)
    },
    timestamp: new Date().toISOString()
  });
}