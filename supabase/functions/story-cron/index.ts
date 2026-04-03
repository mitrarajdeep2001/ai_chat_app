import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // This is called periodically by pg_cron
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find and delete stories where expires_at < now()
    const { data: expiredStories, error: selectErr } = await supabase
      .from('stories')
      .select('id, media_url')
      .lt('expires_at', new Date().toISOString());

    if (selectErr) throw selectErr;

    if (expiredStories && expiredStories.length > 0) {
      const ids = expiredStories.map((s) => s.id);
      
      // Delete from Database
      await supabase.from('stories').delete().in('id', ids);
      
      // Extract file paths from media_url and delete from Storage
      const filePaths = expiredStories.map((s) => {
        const parts = s.media_url.split('/chat_media/');
        return parts.length > 1 ? parts[1] : null;
      }).filter(Boolean) as string[];

      if (filePaths.length > 0) {
         await supabase.storage.from('chat_media').remove(filePaths);
      }
    }

    return new Response(`Processed ${expiredStories?.length || 0} expired stories.`, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(String(err?.message ?? err), { status: 500 });
  }
});
