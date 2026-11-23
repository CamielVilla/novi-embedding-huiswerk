'use client'

import {useChat} from "@ai-sdk/react";
// Les 13: helper die het gesprek automatisch laat doorgaan na goedkeuring of weigering
import {lastAssistantMessageIsCompleteWithApprovalResponses} from "ai";
import Link from "next/link";
import {useState} from "react";
// Les 12: getypeerde berichten en de weergave van tools
import type {ChatMessage} from "@/lib/chat/types";
import ToolWeergave from "@/app/components/ToolWeergave";

type ChatProps = {
    id: string;
    initialMessages?: ChatMessage[];
};

export default function Chat ({ id, initialMessages }: ChatProps) {


    // Les 12: useChat met ChatMessage, zodat de tool-parts getypeerd zijn
    // Les 13: addToolApprovalResponse en sendAutomaticallyWhen voor de goedkeuring van slaVacatureOp
    const { messages, sendMessage, status, error, stop, regenerate, addToolApprovalResponse } = useChat<ChatMessage>({
        id,
        messages: initialMessages,
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    });
    const isLoading = status === 'submitted' || status === 'streaming';
    const [input, setInput] = useState('');
    // Les 13: de knop "Analyseer als vacature" is weg. Analyseren en opslaan gaan nu via de tools in de chat.

    return (
        <main className="mx-auto flex h-screen w-full max-w-2xl flex-col p-4">
            {/* Les 13 (kant-en-klare opmaak): link naar de pagina met opgeslagen vacatures */}
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Les 9 Chatbot</h1>
                <Link href="/opgeslagen" className="text-sm font-semibold text-blue-700 underline">
                    Opgeslagen vacatures
                </Link>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
                {messages.length === 0 && (
                    <p className="text-gray-400">Stel een vraag om te beginnen.</p>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                    >
                        <div
                            className={
                                message.role === 'user'
                                    ? 'max-w-[80%] whitespace-pre-wrap rounded-lg bg-blue-600 px-4 py-2 text-white'
                                    : 'max-w-[80%] whitespace-pre-wrap rounded-lg bg-gray-100 px-4 py-2 text-gray-900'
                            }
                        >
                            {/* Les 12: naast tekst ook tool-parts tonen */}
                            {message.parts.map((part, index) => {
                                if (part.type === 'text') return <span key={index}>{part.text}</span>;
                                if (part.type.startsWith('tool-')) {
                                    return (
                                        <div key={index} className="my-2 whitespace-normal">
                                            <ToolWeergave part={part} addToolApprovalResponse={addToolApprovalResponse} />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                ))}

                {status === 'submitted' && (
                    <p className="animate-pulse text-gray-500">Aan het nadenken...</p>
                )}

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                        <p>Er ging iets mis bij het ophalen van een antwoord.</p>
                        <button
                            type="button"
                            onClick={() => regenerate()}
                            className="mt-2 text-sm font-semibold underline"
                        >
                            Opnieuw proberen
                        </button>
                    </div>
                )}
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (!input.trim()) return;
                    sendMessage({ text: input });
                    setInput('');
                }}
                className="mt-4 flex gap-2"
            >
                <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Typ je bericht..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-600 focus:outline-none"
                />

                {isLoading ? (
                    <button
                        type="button"
                        onClick={() => stop()}
                        className="rounded-lg bg-gray-700 px-4 py-2 font-semibold text-white hover:bg-gray-800"
                    >
                        Stop
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        Verstuur
                    </button>
                )}
            </form>
        </main>
    );
}
