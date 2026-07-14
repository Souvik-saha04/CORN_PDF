export const MOCK_DOCS = [
  { id: 1, name: 'Research Paper — AI Ethics.pdf', size: '2.4 MB', date: 'Apr 6', emoji: '📘', color: '#f5c518' },
  { id: 2, name: 'Q4 Financial Report.pdf',        size: '1.1 MB', date: 'Apr 5', emoji: '📊', color: '#f97316' },
  { id: 3, name: 'Product Roadmap 2026.pdf',        size: '3.7 MB', date: 'Apr 3', emoji: '🗺️', color: '#fbbf24' },
  { id: 4, name: 'Biology Textbook Ch12.pdf',       size: '5.2 MB', date: 'Apr 1', emoji: '🧬', color: '#ef4444' },
];

export const MOCK_MESSAGES = [
  { id: 1, role: 'ai',   text: "Hello! I've analysed your document. Ask me anything about it — or try one of the suggestions below." },
  { id: 2, role: 'user', text: 'Can you summarise the main argument?' },
  { id: 3, role: 'ai',   text: 'The paper argues that current AI alignment approaches prioritise capability over safety, proposing a three-tier governance model where technical constraints, institutional oversight, and societal feedback loops work in concert. The authors contend that no single layer is sufficient and advocate for their "layered safety" framework.', label: 'Answer' },
];

export const QUIZ_QUESTIONS = [
  {
    q: "Why can't the wind be seen while the wind can be felt? Explain.",
    options: [
      'Wind consists of moving air particles that are invisible but create sensations when they interact with our skin.',
      'Wind is made of tiny water droplets that are too small to see.',
      'Wind moves too fast for human eyes to detect.',
      'Wind is a type of electromagnetic radiation.',
    ],
    correct: 0,
  },
  {
    q: 'Which governance tier does the paper consider most critical for long-term AI safety?',
    options: [
      'Technical constraints embedded at model training.',
      'Institutional oversight via regulatory bodies.',
      'Societal feedback loops through public participation.',
      'All three tiers are considered equally critical.',
    ],
    correct: 3,
  },
];

export const SUGGESTIONS = [
  '📌 Summarise key points',
  '🔍 Find specific section',
  '❓ What is the conclusion?',
  '📊 List all statistics',
];