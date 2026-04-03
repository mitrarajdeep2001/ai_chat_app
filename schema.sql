-- --- 1. USERS ---
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- --- 2. CONTACTS ---
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  contact_user_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, contact_user_id)
);

-- --- 3. CHATS ---
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT CHECK (type IN ('direct', 'group', 'ai')) NOT NULL,
  name TEXT,
  created_by UUID REFERENCES public.users(id),
  last_message_id UUID, -- To be linked to messages table later
  created_at TIMESTAMPTZ DEFAULT now()
);

-- --- 4. CHAT_MEMBERS ---
CREATE TABLE IF NOT EXISTS public.chat_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

-- --- 5. MESSAGES ---
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT,
  type TEXT CHECK (type IN ('text', 'image', 'video', 'audio', 'gif')) DEFAULT 'text',
  status TEXT CHECK (status IN ('sent', 'delivered', 'seen')) DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Circular ref fix
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_last_message') THEN
    ALTER TABLE public.chats ADD CONSTRAINT fk_last_message FOREIGN KEY (last_message_id) REFERENCES public.messages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- --- 6. MESSAGE_READS ---
CREATE TABLE IF NOT EXISTS public.message_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- --- 7. STORIES ---
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'video')) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- --- 8. CALLS ---
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('audio', 'video')) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending'
);

-- --- 9. AI TABLES ---
CREATE TABLE IF NOT EXISTS public.message_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  suggestions TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  summary TEXT NOT NULL,
  last_message_id UUID REFERENCES public.messages(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- --- 10. INDEXES ---
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON public.messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON public.chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_message_user ON public.message_reads(message_id, user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_expires ON public.stories(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON public.contacts(user_id);
