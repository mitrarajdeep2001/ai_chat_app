/**
 * Enable Realtime for:
 * - messages
 * - chats
 * - message_reads
 * - stories
 */

begin;
  -- Recreate publication just in case
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

-- Add tables to the publication
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.chats;
alter publication supabase_realtime add table public.message_reads;
alter publication supabase_realtime add table public.stories;
