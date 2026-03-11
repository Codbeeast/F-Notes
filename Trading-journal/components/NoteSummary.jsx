import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Sparkles, AlertCircle, Brain } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useTrades } from '../context/TradeContext';
import FeatureLock from './FeatureLock';

const NotesSummary = () => {
  const { user } = useUser();
  const { trades, loading, error } = useTrades();
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState('');
  const [lastGenerated, setLastGenerated] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasBeenGenerated, setHasBeenGenerated] = useState(false);

  // Subscription state
  const [featureAccess, setFeatureAccess] = useState({ hasAccess: true, loading: true });

  // Check feature access
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setFeatureAccess({ hasAccess: false, loading: false, reason: 'no_user' });
        return;
      }

      try {
        const response = await fetch('/api/subscription/feature-access?feature=notesSummary');
        const data = await response.json();
        setFeatureAccess({ ...data, loading: false });
      } catch (error) {
        console.error('Error checking feature access:', error);
        setFeatureAccess({ hasAccess: false, loading: false, reason: 'error' });
      }
    };

    checkAccess();
  }, [user]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const extractNotes = () => {
    return trades
      .filter(trade => trade.notes && trade.notes.trim().length > 0)
      .map(trade => ({
        date: trade.date,
        note: trade.notes.trim()
      }));
  };

  const generateNotesSummary = async () => {
    setIsGenerating(true);
    setApiError('');

    try {
      const notesData = extractNotes();

      if (notesData.length === 0) {
        setSummary("No trading notes found to analyze. Start adding notes to your trades to get AI-powered insights!");
        setLastGenerated(new Date());
        setHasBeenGenerated(true);
        setIsGenerating(false);
        return;
      }

      const prompt = `
You are an expert trading psychology analyst. Analyze ONLY the trading notes below. Focus exclusively on what the trader wrote in their notes.

Trading Notes:
${notesData.map((trade, index) => `
Note ${index + 1} (Date: ${trade.date}):
${trade.note}
`).join('\n')}

Provide a short analysis based ONLY on what is written in the notes. Do not talk about numbers, P&L, or trading performance. Only analyze the thoughts, feelings, and observations the trader wrote.
You should also refer the trader as you and make sure to don't use trader instead refer a trader as you.
Use this format (keep each section brief with 2-3 bullet points):

## Trading Notes Analysis

**Key Patterns Identified:**
• [What patterns do you see in what the trader is writing about?]
• [What topics or themes come up often in the notes?]

**Recommendations:**
• [One specific action based on what the notes reveal]
• [Another specific action based on the notes]

**Areas for Improvement:**
• [One mental or emotional area to work on based on the notes]
• [Another area to improve based on what the trader wrote]

**Strengths to Maintain:**
• [One good habit or mindset shown in the notes]
• [Another strength visible in the notes]

Keep the language very simple. Use easy words that anyone can understand. Each point should be 1-2 sentences only. Focus only on what the trader actually wrote in their notes.
      `;

      const response = await fetch('/api/analyze-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          notesCount: notesData.length
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.analysis) {
        throw new Error('No analysis received from API');
      }

      setSummary(data.analysis);
      setLastGenerated(new Date());
      setHasBeenGenerated(true);

    } catch (err) {
      console.error('Error generating summary:', err);
      setApiError(`Failed to generate summary: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading || featureAccess.loading) {
    return (
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-slate-800/20 rounded-2xl blur-2xl transition-all duration-1000 shadow-blue-500/30 animate-pulse" />
        <div className="relative backdrop-blur-2xl bg-slate-900/85 border border-blue-500/40 rounded-2xl p-6 md:p-8 w-full overflow-hidden shadow-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-3"></div>
            <span className="text-gray-300 text-lg">Analyzing...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show feature lock if no access
  if (!featureAccess.hasAccess) {
    return (
      <div className="relative group w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-slate-800/20 rounded-2xl blur-2xl transition-all duration-1000 shadow-blue-500/30" />
        <div className="relative">
          <FeatureLock
            featureName="Psychology AI Analysis"
            description="Unlock AI-powered analysis of your trading psychology, patterns, and emotional triggers to improve your trading discipline."
            reason={featureAccess.reason}
            daysRemaining={featureAccess.daysRemaining || 0}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative group w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-slate-800/20 rounded-2xl blur-2xl group-hover:from-blue-500/30 group-hover:via-cyan-400/30 group-hover:to-slate-700/30 transition-all duration-1000 shadow-blue-500/30" />

      <div className="relative backdrop-blur-2xl bg-slate-900/85 border border-blue-500/40 rounded-2xl p-6 md:p-8 w-full overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="text-center md:text-left flex-1">
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent drop-shadow-lg mb-2">
              Notes Summary Analysis
            </h3>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-sm">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span>
                {lastGenerated ? `Last updated: ${lastGenerated.toLocaleTimeString()}` : 'Click sync to analyze'}
              </span>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <button
              onClick={generateNotesSummary}
              disabled={isGenerating || extractNotes().length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border-none rounded-xl font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-500/40"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">
                {isGenerating ? 'Analyzing...' : 'Sync & Analyze'}
              </span>
              <span className="md:hidden">
                {isGenerating ? 'Analyzing...' : 'Sync'}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 md:p-8 min-h-[400px]">
          {extractNotes().length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <FileText className="w-16 h-16 text-gray-500" />
              <div className="text-center px-4">
                <h4 className="text-xl font-semibold text-white mb-2">
                  No Notes to Analyze
                </h4>
                <p className="text-gray-400">
                  Start adding notes to your trades to get AI-powered insights and analysis.
                </p>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                <div className="h-6 w-48 bg-gray-600 rounded animate-pulse"></div>
              </div>

              {[1, 2, 3, 4].map((section) => (
                <div key={section} className="flex flex-col gap-3">
                  <div className="h-5 w-40 bg-gray-500 rounded animate-pulse"></div>
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="h-4 w-full bg-gray-600 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="h-4 w-3/4 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-col items-center justify-center pt-8 gap-4">
                <div className="relative">
                  <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                  <Brain className="w-4 h-4 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">
                    Analyzing {extractNotes().length} notes...
                  </p>
                </div>
              </div>
            </div>
          )}

          {(error || apiError) && !isGenerating && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-red-300 font-medium mb-1">Analysis Failed</p>
                <p className="text-red-400 text-sm break-words">{error || apiError}</p>
              </div>
            </div>
          )}

          {summary && !isGenerating && !error && !apiError && (
            <div className="max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {summary.split('\n').map((line, index) => {
                  if (line.startsWith('##')) {
                    return (
                      <h3 key={index} className="text-xl font-bold text-white mt-4 mb-3 first:mt-0 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <span className="break-words">{line.replace('##', '').trim()}</span>
                      </h3>
                    );
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <h4 key={index} className="text-lg font-semibold text-blue-300 mt-3 mb-2 break-words">
                        {line.replace(/\*\*/g, '')}
                      </h4>
                    );
                  }
                  if (line.startsWith('•')) {
                    return (
                      <div key={index} className="flex items-start gap-3 mb-1.5 ml-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300 break-words min-w-0 flex-1">
                          {line.replace('•', '').trim()}
                        </span>
                      </div>
                    );
                  }
                  if (line.trim() === '') {
                    return <div key={index} className="h-2" />;
                  }
                  return (
                    <p key={index} className="text-gray-300 mb-2 break-words">
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {!hasBeenGenerated && extractNotes().length > 0 && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <RefreshCw className="w-16 h-16 text-blue-400" />
              <div className="text-center px-4">
                <h4 className="text-xl font-semibold text-white mb-2">
                  Ready to Analyze
                </h4>
                <p className="text-gray-400 mb-4">
                  {extractNotes().length} notes available for analysis. Click "Sync & Analyze" to generate insights.
                </p>
              </div>
            </div>
          )}
        </div>

        {extractNotes().length > 0 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 backdrop-blur-sm rounded-full border border-blue-500/30">
              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
              <span className="text-gray-300 text-sm">{extractNotes().length} Notes Available</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default NotesSummary;