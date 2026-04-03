-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_summaries ENABLE ROW LEVEL SECURITY;

-- 1. Users
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- For simplicity in a chat app, any authenticated user can view basic profile info.
CREATE POLICY "Any authenticated user can view users"
  ON public.users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 2. Contacts
CREATE POLICY "Users can view their own contacts"
  ON public.contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own contacts"
  ON public.contacts FOR ALL
  USING (auth.uid() = user_id);

-- 3. Chats
CREATE POLICY "Users can view chats they participate in"
  ON public.chats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats"
  ON public.chats FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- 4. Chat Members
CREATE POLICY "Users can view members of their chats"
  ON public.chat_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = chat_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert members if they created the chat or are admins"
  ON public.chat_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = chat_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM public.chats c
      WHERE c.id = chat_id AND c.created_by = auth.uid()
    )
  );

-- 5. Messages
CREATE POLICY "Users can view messages in their chats"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = chat_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages into their chats"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = chat_id AND cm.user_id = auth.uid()
    )
  );

-- 6. Message Reads
CREATE POLICY "Users can view read receipts for their chats"
  ON public.message_reads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.chat_members cm ON m.chat_id = cm.chat_id
      WHERE m.id = message_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON public.message_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. Stories
CREATE POLICY "Users can view all stories (authenticated)"
  ON public.stories FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own stories"
  ON public.stories FOR ALL
  USING (auth.uid() = user_id);

-- 8. Calls
CREATE POLICY "Users can view/join calls in their chats"
  ON public.calls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = chat_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage calls in their chats"
  ON public.calls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = chat_id AND cm.user_id = auth.uid()
    )
  );
