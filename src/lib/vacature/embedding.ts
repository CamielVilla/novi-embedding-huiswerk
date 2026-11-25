// Les 13: hier komt alles rond embeddings op één plek.

// TODO: kies een embeddingmodel, bijvoorbeeld openai.embeddingModel('text-embedding-3-small')
import {openai} from "@ai-sdk/openai";
import {Vacature} from "../../../../ai-dev-chatbot-docent-les-13/src/lib/vacature/schema";
import {embed} from "ai";

export const EMBEDDING_MODEL = openai.embeddingModel('text-embedding-3-small')

// TODO: maak een functie embeddingTekst(vacature) die bepaalt welke velden je embedt.
//       Denk na: alleen de titel, ook niveau en vaardigheden, of de hele tekst?

export function embeddingTekst(vacature: Vacature) {
    const result = [
        vacature.functietitel,
        `Niveau: ${vacature.niveau}`,
        `Vaardigheden: ${vacature.vaardigheden.join(', ')}`,
    ].join('\n');
    // console.log('embeddingTekst functie' + result)
    return result
}

// TODO: maak een functie maakEmbedding(tekst) die met embed() een embedding maakt en die teruggeeft
export async function maakEmbedding(tekst: string) {
    const { embedding } = await embed({
        model: EMBEDDING_MODEL,
        value: tekst,
    })
    return embedding;
}

export {};
