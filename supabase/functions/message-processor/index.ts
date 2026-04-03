import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateSmartReplies, checkToxicity } from "../_shared/ai.ts";
import { sendPushNotification } from "../_shared/notifications.ts";

serve(async (req) => {
  try {
    const payload = await req.json();
    const { record: message } = payload;
    
    if (!message || !message.content) {
      return new Response("No message content", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Toxicity Check
    const isFlagged = await checkToxicity(message.content);
    if (isFlagged) {
       await supabase
         .from("messages")
         .update({ is_flagged: true })
         .eq("id", message.id);
    }

    // 2. Notification Stub
    const { data: members } = await supabase
       .from("chat_members")
       .select("user_id")
       .eq("chat_id", message.chat_id)
       .neq("user_id", message.sender_id);

    if (members && members.length > 0) {
       const userIds = members.map((m: any) => m.user_id);
       await sendPushNotification(userIds, { message_id: message.id, content: message.content });
    }

    // 3. Smart Replies
    if (message.type === 'text' && !isFlagged) {
      const suggestions = await generateSmartReplies(message.content);
      await supabase.from("message_suggestions").insert({
        message_id: message.id,
        suggestions: suggestions
      });
    }

    return new Response("Message processed successfully", { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(String(err?.message ?? err), { status: 500 });
  }
});
