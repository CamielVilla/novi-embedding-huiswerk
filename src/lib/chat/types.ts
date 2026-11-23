// Les 12: berichttype met getypeerde tool-parts, zodat TypeScript weet wat er in part.input en part.output staat
import type { InferUITools, UIMessage } from 'ai';
import type { tools } from '@/lib/tools';

export type ChatMessage = UIMessage<unknown, never, InferUITools<typeof tools>>;
export type ChatMessagePart = ChatMessage['parts'][number];
