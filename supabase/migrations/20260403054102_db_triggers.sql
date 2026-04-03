-- 1. Read Receipt Handler
CREATE OR REPLACE FUNCTION public.handle_read_receipt()
RETURNS TRIGGER AS $$
BEGIN
  -- We update the message to 'seen' when someone inserts a read receipt.
  -- Depending on business logic, this might be better left as a complex join,
  -- but updating the column is faster for a simple read receipt model.
  UPDATE public.messages
  SET status = 'seen'
  WHERE id = NEW.message_id AND status != 'seen';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_read ON public.message_reads;
CREATE TRIGGER on_message_read
  AFTER INSERT ON public.message_reads
  FOR EACH ROW EXECUTE PROCEDURE public.handle_read_receipt();

-- 2. Last Message Updater
CREATE OR REPLACE FUNCTION public.handle_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats
  SET last_message_id = NEW.id
  WHERE id = NEW.chat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_inserted ON public.messages;
CREATE TRIGGER on_message_inserted
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE PROCEDURE public.handle_last_message();
