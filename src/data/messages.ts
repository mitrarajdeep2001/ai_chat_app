import { Message } from '@/types';

const now = new Date();
const mins = (n: number) => new Date(now.getTime() - n * 60000).toISOString();
const hours = (n: number) => new Date(now.getTime() - n * 3600000).toISOString();
const days = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();

// ----- Chat 1: Alex ↔ Sarah (Direct) -----
export const chat1Messages: Message[] = [
  { id: 'm1-1', chatId: 'chat-1', senderId: 'user-1', content: 'Hey! How\'s the new project coming along? 😊', type: 'text', status: 'seen', timestamp: hours(5) },
  { id: 'm1-2', chatId: 'chat-1', senderId: 'user-0', content: 'Pretty good! Just finished the design system. Check this out 👇', type: 'text', status: 'seen', timestamp: hours(4.9) },
  { id: 'm1-3', chatId: 'chat-1', senderId: 'user-0', content: 'https://example.com/design-preview.png', type: 'image', status: 'seen', timestamp: hours(4.85), attachments: [{ id: 'att-1', type: 'image', url: 'https://picsum.photos/seed/design/400/300', name: 'design-preview.png', size: 204800 }] },
  { id: 'm1-4', chatId: 'chat-1', senderId: 'user-1', content: 'Oh wow, this looks absolutely stunning! 😍 The color palette is perfect', type: 'text', status: 'seen', timestamp: hours(4.7) },
  { id: 'm1-5', chatId: 'chat-1', senderId: 'user-1', content: 'Did you use Figma for this?', type: 'text', status: 'seen', timestamp: hours(4.65) },
  { id: 'm1-6', chatId: 'chat-1', senderId: 'user-0', content: 'Yeah, Figma + our custom token system. It\'s been a game changer honestly', type: 'text', status: 'seen', timestamp: hours(4.5) },
  { id: 'm1-7', chatId: 'chat-1', senderId: 'user-1', content: 'We should do a design review call this week! 📅', type: 'text', status: 'seen', timestamp: hours(2) },
  { id: 'm1-8', chatId: 'chat-1', senderId: 'user-0', content: 'Absolutely! How about Thursday at 3pm?', type: 'text', status: 'seen', timestamp: hours(1.9) },
  { id: 'm1-9', chatId: 'chat-1', senderId: 'user-1', content: 'Thursday works great! I\'ll send a calendar invite 🗓️', type: 'text', status: 'seen', timestamp: hours(1) },
  { id: 'm1-10', chatId: 'chat-1', senderId: 'user-0', content: 'Perfect! Looking forward to it 🚀', type: 'text', status: 'delivered', timestamp: mins(45) },
  { id: 'm1-11', chatId: 'chat-1', senderId: 'user-1', content: 'Also, have you seen the new Framer updates? They dropped some insane features', type: 'text', status: 'delivered', timestamp: mins(20) },
  { id: 'm1-12', chatId: 'chat-1', senderId: 'user-0', content: 'Not yet! Sending me the link? 🔗', type: 'text', status: 'sent', timestamp: mins(5) },
];

// ----- Chat 2: Alex ↔ Marcus (Direct) -----
export const chat2Messages: Message[] = [
  { id: 'm2-1', chatId: 'chat-2', senderId: 'user-2', content: 'Yo, the API is throwing 500s in production 😭', type: 'text', status: 'seen', timestamp: hours(3) },
  { id: 'm2-2', chatId: 'chat-2', senderId: 'user-0', content: 'What?! Which endpoint?', type: 'text', status: 'seen', timestamp: hours(2.9) },
  { id: 'm2-3', chatId: 'chat-2', senderId: 'user-2', content: '/api/v2/users/sync - seems like a DB connection issue', type: 'text', status: 'seen', timestamp: hours(2.8) },
  { id: 'm2-4', chatId: 'chat-2', senderId: 'user-0', content: 'I\'ll check the logs. Give me 5 mins', type: 'text', status: 'seen', timestamp: hours(2.7) },
  { id: 'm2-5', chatId: 'chat-2', senderId: 'user-0', content: 'Found it! Connection pool was exhausted. Pushed a fix 🔧', type: 'text', status: 'seen', timestamp: hours(2.5) },
  { id: 'm2-6', chatId: 'chat-2', senderId: 'user-2', content: 'LEGEND! You saved us 🙌🙌🙌', type: 'text', status: 'seen', timestamp: hours(2.4) },
  { id: 'm2-7', chatId: 'chat-2', senderId: 'user-2', content: 'Deployments looking good now. All green ✅', type: 'text', status: 'seen', timestamp: hours(2) },
  { id: 'm2-8', chatId: 'chat-2', senderId: 'user-0', content: 'Nice! Let\'s add better connection monitoring going forward', type: 'text', status: 'seen', timestamp: hours(1.5) },
  { id: 'm2-9', chatId: 'chat-2', senderId: 'user-2', content: 'Agreed. Also the PR for the auth refactor is ready for review btw', type: 'text', status: 'delivered', timestamp: mins(30) },
];

// ----- Chat 3: Group Chat - Design Squad -----
export const chat3Messages: Message[] = [
  { id: 'm3-1', chatId: 'chat-3', senderId: 'user-1', content: 'Good morning Design Squad! ☀️ Ready for today\'s sprint?', type: 'text', status: 'seen', timestamp: hours(8) },
  { id: 'm3-2', chatId: 'chat-3', senderId: 'user-3', content: 'Born ready! 💪 I finished the wireframes last night', type: 'text', status: 'seen', timestamp: hours(7.9) },
  { id: 'm3-3', chatId: 'chat-3', senderId: 'user-0', content: 'Awesome work everyone! Let\'s crush it today 🚀', type: 'text', status: 'seen', timestamp: hours(7.8) },
  { id: 'm3-4', chatId: 'chat-3', senderId: 'user-5', content: 'Quick question — are we going with the rounded or sharp corners for the cards?', type: 'text', status: 'seen', timestamp: hours(6) },
  { id: 'm3-5', chatId: 'chat-3', senderId: 'user-1', content: 'Rounded! 100%. More modern feel', type: 'text', status: 'seen', timestamp: hours(5.9) },
  { id: 'm3-6', chatId: 'chat-3', senderId: 'user-3', content: 'Agreed! Here\'s the updated comp 👇', type: 'text', status: 'seen', timestamp: hours(5.8) },
  { id: 'm3-7', chatId: 'chat-3', senderId: 'user-3', content: '', type: 'image', status: 'seen', timestamp: hours(5.75), attachments: [{ id: 'att-2', type: 'image', url: 'https://picsum.photos/seed/comp/400/300', name: 'comp-update.png', size: 307200 }] },
  { id: 'm3-8', chatId: 'chat-3', senderId: 'user-0', content: 'This is 🔥🔥🔥 Priya, you absolutely nailed it!', type: 'text', status: 'seen', timestamp: hours(5) },
  { id: 'm3-9', chatId: 'chat-3', senderId: 'user-5', content: 'Love the new direction. Can we bump up the heading font weight a bit?', type: 'text', status: 'seen', timestamp: hours(3) },
  { id: 'm3-10', chatId: 'chat-3', senderId: 'user-1', content: 'On it! Will push updated assets by EOD', type: 'text', status: 'delivered', timestamp: hours(1) },
  { id: 'm3-11', chatId: 'chat-3', senderId: 'user-0', content: 'Standup in 10 everyone! 👆', type: 'text', status: 'sent', timestamp: mins(10) },
];

// ----- Chat 4: Alex ↔ AI Assistant -----
export const chat4Messages: Message[] = [
  { id: 'm4-1', chatId: 'chat-4', senderId: 'user-0', content: 'Hey Nexus! Can you explain the difference between REST and GraphQL?', type: 'text', status: 'seen', timestamp: hours(2) },
  { id: 'm4-2', chatId: 'chat-4', senderId: 'ai-assistant', content: 'Great question! Here\'s a concise breakdown:\n\n**REST (Representational State Transfer)**\n• Multiple endpoints for different resources\n• Fixed data structure per endpoint\n• Over/under-fetching can be an issue\n• Widely adopted, easy to cache\n\n**GraphQL**\n• Single endpoint, flexible queries\n• Request exactly what you need\n• Strongly typed schema\n• Real-time with subscriptions\n• Steeper learning curve initially\n\n**Bottom line:** Use REST for simple APIs and better caching. Choose GraphQL when your frontend needs vary greatly or you want to avoid over-fetching. 🚀', type: 'ai', status: 'seen', timestamp: hours(1.95) },
  { id: 'm4-3', chatId: 'chat-4', senderId: 'user-0', content: 'That\'s really helpful! What about tRPC?', type: 'text', status: 'seen', timestamp: hours(1.8) },
  { id: 'm4-4', chatId: 'chat-4', senderId: 'ai-assistant', content: '**tRPC** is a fantastic option if you\'re working in a full-stack TypeScript environment!\n\n**Key advantages:**\n• End-to-end type safety (no code generation needed)\n• Works great with Next.js\n• Auto-completion across frontend & backend\n• Smaller bundle size than GraphQL\n\n**Best for:** TypeScript monorepos where frontend and backend are in the same codebase. It\'s become incredibly popular in the Next.js + Prisma ecosystem! 💡', type: 'ai', status: 'seen', timestamp: hours(1.75) },
  { id: 'm4-5', chatId: 'chat-4', senderId: 'user-0', content: 'Can you write me a simple React hook for debouncing?', type: 'text', status: 'seen', timestamp: hours(1) },
  { id: 'm4-6', chatId: 'chat-4', senderId: 'ai-assistant', content: 'Here\'s a clean `useDebounce` hook:\n\n```typescript\nimport { useState, useEffect } from \'react\';\n\nfunction useDebounce<T>(value: T, delay: number): T {\n  const [debouncedValue, setDebouncedValue] = useState<T>(value);\n\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delay);\n\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n\n  return debouncedValue;\n}\n\nexport default useDebounce;\n```\n\n**Usage:**\n```tsx\nconst debouncedSearch = useDebounce(searchTerm, 300);\n```\n\nThe cleanup function ensures it cancels the timeout on re-renders! ✨', type: 'ai', status: 'delivered', timestamp: mins(15) },
];

// ----- Chat 5: Alex ↔ Priya -----
export const chat5Messages: Message[] = [
  { id: 'm5-1', chatId: 'chat-5', senderId: 'user-3', content: 'Hey Alex! Did you review the Q4 roadmap doc?', type: 'text', status: 'seen', timestamp: days(1) },
  { id: 'm5-2', chatId: 'chat-5', senderId: 'user-0', content: 'Yes! Looks solid. I left some comments on the auth section', type: 'text', status: 'seen', timestamp: days(1) },
  { id: 'm5-3', chatId: 'chat-5', senderId: 'user-3', content: 'Perfect, I\'ll address those. Also — are you coming to the offsite next month?', type: 'text', status: 'seen', timestamp: days(1) },
  { id: 'm5-4', chatId: 'chat-5', senderId: 'user-0', content: 'Absolutely! Already booked my flights ✈️', type: 'text', status: 'seen', timestamp: hours(20) },
  { id: 'm5-5', chatId: 'chat-5', senderId: 'user-3', content: 'Amazing! It\'s going to be such a great team event 🎉', type: 'text', status: 'delivered', timestamp: hours(5) },
];

// ----- Chat 6: Group - Dev Team -----
export const chat6Messages: Message[] = [
  { id: 'm6-1', chatId: 'chat-6', senderId: 'user-2', content: 'Team, sprint planning in 30 mins. Don\'t be late! ⏰', type: 'text', status: 'seen', timestamp: hours(1) },
  { id: 'm6-2', chatId: 'chat-6', senderId: 'user-6', content: 'On my way! Just finishing up a bug fix', type: 'text', status: 'seen', timestamp: hours(0.9) },
  { id: 'm6-3', chatId: 'chat-6', senderId: 'user-0', content: 'I\'ll be there. Prepping the ticket list now', type: 'text', status: 'seen', timestamp: hours(0.8) },
  { id: 'm6-4', chatId: 'chat-6', senderId: 'user-2', content: 'Also reminder: Code freeze is Friday! 🚨', type: 'text', status: 'delivered', timestamp: mins(20) },
  { id: 'm6-5', chatId: 'chat-6', senderId: 'user-6', content: 'Got it. I\'ll prioritize the critical path items', type: 'text', status: 'sent', timestamp: mins(5) },
];

export const allMessages: Record<string, Message[]> = {
  'chat-1': chat1Messages,
  'chat-2': chat2Messages,
  'chat-3': chat3Messages,
  'chat-4': chat4Messages,
  'chat-5': chat5Messages,
  'chat-6': chat6Messages,
};
