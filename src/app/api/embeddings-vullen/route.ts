// Les 13: tijdelijke Route Handler die embeddings berekent voor vacatures die al waren opgeslagen.
// Open /api/embeddings-vullen in de browser zodra je hem hebt gebouwd.
import { connection } from 'next/server';

export async function GET() {
    await connection();

    // Alleen lokaal te gebruiken, niet in productie
    if (process.env.NODE_ENV !== 'development') {
        return new Response('Niet beschikbaar', { status: 404 });
    }

    // TODO: haal alle vacatures op die nog geen embedding hebben, bijvoorbeeld met .is('embedding', null)
    // TODO: maak met embedMany() in één keer de embeddings van hun embeddingTekst()
    // TODO: sla elke embedding op bij de juiste vacature, met .update() en .eq('id', ...)
    // TODO: geef terug hoeveel vacatures er zijn bijgewerkt

    return Response.json({ melding: 'Nog niet gebouwd.' }, { status: 501 });
}
