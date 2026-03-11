// Helper functions for TradeJournal

export const DROPDOWN_OPTIONS = {
  pairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'NZD/USD', 'USD/CHF', 'USD/CAD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'],
  positionType: ['Long', 'Short'],
  setupTypes: [
    'Trend Continuation',
    'Trend Reversal',
    'Breakout',
    'Pullback',
    'Range Trading',
    'Support/Resistance',
    'Mixed',
    'Other'
  ],
  entryTypes: [
    'Retest',
    'Market Entry',
    'Limit Order',
    'Stop Order',
    'Pending Order',
    'Break and Retest',
    'Entry',
    'Exit',
    'Other'
  ],
  confluences: [
    'Supply/Demand Zone',
    'Trendline',
    'Moving Average',
    'Fibonacci',
    'Support/Resistance',
    'Chart Pattern',
    'Volume Analysis',
    'RSI Divergence',
    'Multiple Confluences'
  ],
  // Updated to support both singular and plural for timeframes
  timeFrames: ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'],
  timeframes: ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'],
  sessions: [
    "Asian",
    "London",
    "New York"
  ],
  trailWorked: ['Yes', 'No'],
  typeOfTrade: ['Long', 'Short', 'Both'],
  entryModels: ['Model A', 'Model B', 'Model C', 'Other'],
  rulesFollowed: ['Yes', 'No'],
  imagePosting: ['Yes', 'No'],
  news: [
    'CPI m/m',
    'Median CPI y/y',
    'Trimmed CPI y/y',
    'Official Cash Rate',
    'RBNZ Monetary Policy Statement',
    'RBNZ Rate Statement',
    'RBNZ Press Conference',
    'CPI y/y',
    'Non-Farm Employment Change',
    'FOMC Meeting Minutes',
    'German Flash Manufacturing PMI',
    'German Flash Services PMI',
    'Flash Manufacturing PMI',
    'Flash Services PMI',
    'Unemployment Claims'
  ],
  affectedByNews: [
    'affected',
    'not affected'
  ],
};

export const baseColumns = [
  "date", "time", "session", "market", "strategy", "pair", "positionType", "entry", "exit", "setupType", "confluences", "entryType", "timeFrame", "risk", "lotSize", "rFactor", "rulesFollowed", "pipsLost", "pnl", "affectedByNews", "news", "image", "notes"
];

// Function to get filtered columns based on trades data
export const getFilteredColumns = (trades = []) => {
  const shouldShowNews = trades.some(trade => shouldShowNewsField(trade.affectedByNews));

  if (shouldShowNews) {
    return baseColumns;
  } else {
    return baseColumns.filter(col => col !== 'news');
  }
};

// Keep the original columns export for backward compatibility
export const columns = baseColumns;

export const initialTrade = {
  date: '',
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  session: '', // Empty by default - user must select manually
  sessionId: '',
  market: '', // Added market field
  strategy: '',
  pair: '',
  positionType: '',
  entry: null,
  exit: null,
  setupType: '',
  confluences: '',
  entryType: '',
  timeFrame: '', // Use timeFrame (singular) to match database
  risk: null,
  lotSize: null,
  rFactor: null,
  rulesFollowed: '',
  pipsLost: null,
  pipsGain: null,
  pnl: null,
  news: '',
  affectedByNews: '',
  newsImpactDetails: '',
  image: '',
  notes: '',
  tfUsed: '',
  fearToGreed: 5,
  fomoRating: 5,
  executionRating: 5,
  patience: 5,
  confidence: 5,
  imagePosting: '',
};

// Helper function to get week number and year
export const getWeekInfo = (dateString) => {
  if (!dateString) return { week: 0, year: 0, weekKey: '' };

  const date = new Date(dateString);
  const year = date.getFullYear();

  // Get the first day of the year
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  return { week, year, weekKey: `${year}-W${week.toString().padStart(2, '0')}` };
};

// Helper function to get month info
export const getMonthInfo = (dateString) => {
  if (!dateString) return { month: 0, year: 0, monthKey: '' };

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return { month, year, monthKey: `${year}-${month.toString().padStart(2, '0')}` };
};

// Helper function to group trades by week and month
export const groupTradesByTime = (trades) => {
  const grouped = {
    months: {},
    weeks: {}
  };

  trades.forEach(trade => {
    if (!trade.date) return;

    // Group by month
    const monthInfo = getMonthInfo(trade.date);
    if (!grouped.months[monthInfo.monthKey]) {
      grouped.months[monthInfo.monthKey] = {
        ...monthInfo,
        trades: [],
        totalPnL: 0,
        winCount: 0,
        totalTrades: 0
      };
    }
    grouped.months[monthInfo.monthKey].trades.push(trade);
    if (trade.pnl) {
      grouped.months[monthInfo.monthKey].totalPnL += trade.pnl;
      grouped.months[monthInfo.monthKey].totalTrades++;
      if (trade.pnl > 0) grouped.months[monthInfo.monthKey].winCount++;
    }

    // Group by week
    const weekInfo = getWeekInfo(trade.date);
    if (!grouped.weeks[weekInfo.weekKey]) {
      grouped.weeks[weekInfo.weekKey] = {
        ...weekInfo,
        trades: [],
        totalPnL: 0,
        winCount: 0,
        totalTrades: 0
      };
    }
    grouped.weeks[weekInfo.weekKey].trades.push(trade);
    if (trade.pnl) {
      grouped.weeks[weekInfo.weekKey].totalPnL += trade.pnl;
      grouped.weeks[weekInfo.weekKey].totalTrades++;
      if (trade.pnl > 0) grouped.weeks[weekInfo.weekKey].winCount++;
    }
  });

  return grouped;
};

// Helper function to format date ranges
export const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return `${startFormatted} - ${endFormatted}`;
};

// Helper function to get week start and end dates
export const getWeekDateRange = (year, week) => {
  const firstDayOfYear = new Date(year, 0, 1);
  const days = (week - 1) * 7;
  const weekStart = new Date(firstDayOfYear);
  weekStart.setDate(firstDayOfYear.getDate() + days - firstDayOfYear.getDay());

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return { start: weekStart, end: weekEnd };
};

// Helper function to get month name
export const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};

export const getDropdownOptions = (field) => {
  switch (field) {
    case 'session':
      return DROPDOWN_OPTIONS.sessions;
    case 'pair':
    case 'pairs':
      return DROPDOWN_OPTIONS.pairs;
    case 'positionType':
      return DROPDOWN_OPTIONS.positionType;
    case 'setupType':
      return DROPDOWN_OPTIONS.setupTypes;
    case 'entryType':
      return DROPDOWN_OPTIONS.entryTypes;
    case 'confluences':
      return DROPDOWN_OPTIONS.confluences;
    case 'timeFrame':
    case 'timeframes': // Support both singular and plural
      return DROPDOWN_OPTIONS.timeframes;
    case 'trailWorked':
      return DROPDOWN_OPTIONS.trailWorked;
    case 'typeOfTrade':
      return DROPDOWN_OPTIONS.typeOfTrade;
    case 'entryModel':
      return DROPDOWN_OPTIONS.entryModels;
    case 'rulesFollowed':
      return DROPDOWN_OPTIONS.rulesFollowed;
    case 'imagePosting':
      return DROPDOWN_OPTIONS.imagePosting;
    case 'news':
      return DROPDOWN_OPTIONS.news;
    case 'affectedByNews':
      return DROPDOWN_OPTIONS.affectedByNews;
    default:
      return [];
  }
};

export const getHeaderName = (field) => {
  const headers = {
    date: 'Date',
    time: 'Time',
    session: 'Session',
    strategy: 'Strategy',
    pair: 'Pair',
    pairs: 'Pair',
    positionType: 'Position Type',
    entry: 'Entry',
    exit: 'Exit',
    setupType: 'Setup Type',
    confluences: 'Confluences',
    entryType: 'Entry Type',
    timeFrame: 'TF Used',
    timeframes: 'TF Used', // Support both singular and plural
    risk: 'Risk/Trade',
    lotSize: 'Lots',
    rFactor: 'R Factor',
    rulesFollowed: 'Rules Followed',
    pipsLost: 'Pips L/C',
    pnl: 'PnL',
    news: 'News',
    affectedByNews: 'Affected by News',
    long: 'Long',
    short: 'Short',
    image: 'Image of Play',
    notes: 'Notes'
  };
  return headers[field] || field;
};

export const getCellType = (field) => {
  if (field === 'date') return 'date';
  if (field === 'time') return 'time';
  if (field === 'image') return 'image';
  if ([
    'entry', 'exit', 'risk', 'lotSize', 'rFactor', 'pipsLost', 'pnl', 'long', 'short'
  ].includes(field)) {
    return 'number';
  }
  if ([
    'strategy', 'session', 'pair', 'pairs', 'positionType', 'setupType', 'entryType', 'confluences', 'timeFrame', 'timeframes', 'trailWorked', 'typeOfTrade', 'entryModel', 'rulesFollowed', 'imagePosting', 'news', 'affectedByNews'
  ].includes(field)) {
    return 'dropdown';
  }
  // Psychology ratings are display-only
  if (['emotionalState', 'confidence', 'discipline', 'patience', 'focus'].includes(field)) {
    return 'psychology';
  }
  return 'text';
};

// Helper function to check if a field is required
export const isFieldRequired = (field) => {
  const requiredFields = [
    'date', 'time', 'session', 'strategy', 'pair', 'positionType', 'entry', 'exit',
    'setupType', 'confluences', 'entryType', 'timeFrame', 'risk', 'lotSize', 'rFactor',
    'rulesFollowed', 'pipsLost', 'pnl'
  ];
  return requiredFields.includes(field);
};

// Helper function to check if a field is empty
export const isFieldEmpty = (value) => {
  return !value || value === '' || value === null || value === undefined;
};

// Helper function to check if news field should be shown
export const shouldShowNewsField = (affectedByNews) => {
  // Show news field only when "affected" is selected
  // Hide when "not affected" or empty/null
  return affectedByNews === 'affected';
};

// Update the cleanTradeData function:
export const cleanTradeData = (tradeData) => {
  const cleaned = { ...tradeData };

  // Ensure affectedByNews has valid enum values
  if (cleaned.affectedByNews) {
    const validValues = ['affected', 'not affected'];
    const trimmedValue = cleaned.affectedByNews.toString().trim();

    if (!validValues.includes(trimmedValue)) {
      console.warn('Invalid affectedByNews value:', cleaned.affectedByNews, 'Setting to default');
      cleaned.affectedByNews = 'not affected';
    } else {
      cleaned.affectedByNews = trimmedValue;
    }
  } else {
    cleaned.affectedByNews = 'not affected';
  }

  // Clean other string fields
  if (cleaned.rulesFollowed && !['Yes', 'No', 'Partially'].includes(cleaned.rulesFollowed)) {
    cleaned.rulesFollowed = 'Yes';
  }

  return cleaned;
};