import { SmartReply } from '@/types';

export const smartReplies: SmartReply[] = [
  { id: 'sr-1', text: 'Sounds great!', emoji: '👍' },
  { id: 'sr-2', text: 'On my way!', emoji: '🚗' },
  { id: 'sr-3', text: 'I\'ll check it out', emoji: '👀' },
  { id: 'sr-4', text: 'Thanks!', emoji: '🙏' },
  { id: 'sr-5', text: 'Sure, no problem!', emoji: '✅' },
  { id: 'sr-6', text: 'Can we talk later?', emoji: '💬' },
  { id: 'sr-7', text: 'Love it! 🔥', emoji: '🔥' },
  { id: 'sr-8', text: 'Let me get back to you', emoji: '⏰' },
];

export const aiSmartReplies: SmartReply[] = [
  { id: 'ai-sr-1', text: 'Explain more', emoji: '💡' },
  { id: 'ai-sr-2', text: 'Give me an example', emoji: '📝' },
  { id: 'ai-sr-3', text: 'Show me the code', emoji: '💻' },
  { id: 'ai-sr-4', text: 'That\'s helpful, thanks!', emoji: '🙏' },
];

export const getContextualReplies = (lastMessage: string): SmartReply[] => {
  const lower = lastMessage.toLowerCase();
  if (lower.includes('meeting') || lower.includes('call')) {
    return [
      { id: 'cr-1', text: 'I\'ll be there!', emoji: '✅' },
      { id: 'cr-2', text: 'Can we reschedule?', emoji: '📅' },
      { id: 'cr-3', text: 'Sounds good!', emoji: '👍' },
    ];
  }
  if (lower.includes('thanks') || lower.includes('thank you')) {
    return [
      { id: 'cr-4', text: 'You\'re welcome!', emoji: '😊' },
      { id: 'cr-5', text: 'Anytime!', emoji: '👋' },
      { id: 'cr-6', text: 'Happy to help!', emoji: '🤝' },
    ];
  }
  if (lower.includes('?')) {
    return [
      { id: 'cr-7', text: 'Yes, definitely!', emoji: '✅' },
      { id: 'cr-8', text: 'Not sure yet', emoji: '🤔' },
      { id: 'cr-9', text: 'Let me check', emoji: '🔍' },
    ];
  }
  return smartReplies.slice(0, 3);
};
