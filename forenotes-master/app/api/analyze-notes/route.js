// app/api/analyze-notes/route.js - For Next.js 15 App Router

export async function POST(request) {
  try {
    const { prompt, notesCount } = await request.json();

    console.log('API called with:', { promptLength: prompt?.length, notesCount });

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not found in environment variables');
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Dynamically import GoogleGenerativeAI to avoid issues
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    console.log('Initializing Gemini model...');
    
    // Get the generative model (using the current model name)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    console.log('Sending request to Gemini...');

    // Generate content using Gemini with error handling
    const result = await model.generateContent(prompt);
    
    console.log('Gemini response received');
    
    const response = await result.response;
    const analysis = response.text();

    if (!analysis) {
      console.error('Empty analysis returned from Gemini');
      return Response.json({ error: 'Failed to generate analysis' }, { status: 500 });
    }

    console.log('Analysis generated successfully, length:', analysis.length);

    return Response.json({
      analysis,
      notesAnalyzed: notesCount || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Detailed API Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Handle specific error types
    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      return Response.json({ error: 'Invalid or missing Gemini API key' }, { status: 401 });
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('429')) {
      return Response.json({ error: 'API rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    if (error.message?.includes('SAFETY')) {
      return Response.json({ error: 'Content was blocked by safety filters. Please try again.' }, { status: 400 });
    }

    // Network or connection errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return Response.json({ error: 'Network error. Please check your internet connection.' }, { status: 503 });
    }

    return Response.json({ 
      error: `API Error: ${error.message || 'Unknown error occurred'}` 
    }, { status: 500 });
  }
}
