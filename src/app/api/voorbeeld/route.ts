import {cosineSimilarity, embed, embedMany} from "ai";
import {EMBEDDING_MODEL} from "@/lib/vacature/embedding";

const ZOEKVRAAG = 'Frontend developer met React'
const TEKSTEN = [
    'Wij zoeken een React-ontwikkelaar',
    'Frontend engineer met ervaring in TypeScript',
    'De frontend van de website ligt eruit',
    'Looking for a junior React developer',
    'Backend developer met Java en Spring',
    'Recept voor pasta met tomatensaus',]

export async function GET() {
    const { embedding } = await embed({
         model: EMBEDDING_MODEL,
         value: ZOEKVRAAG,
     })

    const { embeddings } = await embedMany( {
         model: EMBEDDING_MODEL,
         values: TEKSTEN,
     })

    const scores = TEKSTEN.map((tekst, index) => ({
        tekst: tekst,
        score: cosineSimilarity(embedding, embeddings[index])
    }));

    scores.sort((a, b) => b.score - a.score)

    return Response.json(scores)

}