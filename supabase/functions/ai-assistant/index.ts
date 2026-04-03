import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateAssistantResponse } from "../_shared/ai.ts";

serve(async (req) => {
  try {
    const payload = await req.json();
    const { record: message } = payload;
    
    if (!message) {
      return new Response("No message content", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: chat } = await supabase
      .from("chats")
      .select("type")
      .eq("id", message.chat_id)
      .single();

    if (chat?.type === 'ai') {
      const { data: recentMessages } = await supabase
        .from("messages")
        .select("content, sender_id")
        .eq("chat_id", message.chat_id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      const history = (recentMessages || []).reverse().map((m: any) => {
        return m.sender_id === message.sender_id ? `User: ${m.content}` : `AI: ${m.content}`;
      }).join("\n");

      const aiResponseText = await generateAssistantResponse(history);
      
      const { data: botUser } = await supabase
          .from("users")
          .select("id")
          .eq("username", "ai_bot")
          .single();

      if (botUser) {
        await supabase.from("messages").insert({
          chat_id: message.chat_id,
          sender_id: botUser.id,
          content: aiResponseText,
          type: 'text',
          status: 'sent'
        });
      }
    }

    return new Response("AI Assistant processed successfully", { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(String(err?.message ?? err), { status: 500 });
  }
});
