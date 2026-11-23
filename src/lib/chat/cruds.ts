import {createSupabaseServerClient} from "@/lib/supabase/server";
import {generateId, type UIMessage} from "ai";
import {Json} from "@/lib/supabase/database.types";
// Les 12: getypeerde berichten met tool-parts
import type {ChatMessage} from "@/lib/chat/types";

export async function getLatestChat() {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
        .from("chats_ai_bot")
        .select("id, messages")
        .order("updated_at", { ascending: false})
        .limit(1)
        .maybeSingle()

    if (error) throw error;
    if (!data) return null;

    return {
        id: data.id,
        // Les 12: de opgeslagen berichten bevatten nu ook tool-parts, dus we gebruiken ChatMessage
        messages: (data.messages as unknown as ChatMessage[]).map((message) =>
            message.id ? message : { ...message, id: generateId() }
        ),
    };
}

export async function saveChat(id: string, messages: UIMessage[]) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
        .from("chats_ai_bot")
        .upsert({
            id,
            messages: messages as unknown as Json,
            updated_at: new Date().toISOString()
        })

    if (error) throw error;
}