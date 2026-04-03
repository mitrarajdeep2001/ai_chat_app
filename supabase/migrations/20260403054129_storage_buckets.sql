-- Create `chat_media` bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_media', 'chat_media', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage if it isn't already
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow participants to upload media (assuming name starts with chat_id/)
CREATE POLICY "Participants can upload chat media" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'chat_media' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.chat_members cm
    WHERE cm.chat_id::text = (string_to_array(name, '/'))[1]
    AND cm.user_id = auth.uid()
  )
);

-- Allow participants to read chat media
CREATE POLICY "Participants can view chat media" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'chat_media' AND
  EXISTS (
    SELECT 1 FROM public.chat_members cm
    WHERE cm.chat_id::text = (string_to_array(name, '/'))[1]
    AND cm.user_id = auth.uid()
  )
);
