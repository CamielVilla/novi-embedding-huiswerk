// Toegevoegd: aparte functie in src/lib die een gecontroleerde vacature opslaat, zoals saveChat() bij de chatgeschiedenis
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Vacature } from '@/lib/vacature/schema';

export async function saveVacature(vacature: Vacature, tekst: string) {
    const supabase = createSupabaseServerClient();

    // TODO (Les 13): maak hier met maakEmbedding() een embedding van embeddingTekst(vacature)

    // camelCase uit het schema wordt hier omgezet naar snake_case in de database
    const { error } = await supabase
        .from('vacatures')
        .insert({
            functietitel: vacature.functietitel,
            bedrijf: vacature.bedrijf,
            niveau: vacature.niveau,
            salaris_min: vacature.salarisMin,
            salaris_max: vacature.salarisMax,
            vaardigheden: vacature.vaardigheden,
            remote: vacature.remote,
            tekst,
            // TODO (Les 13): sla de embedding op in de kolom embedding. In de gegenereerde types is dat een string: gebruik JSON.stringify(embedding)
        });

    if (error) throw error;
}

// TODO (Les 13): maak een functie zoekOpBetekenis(zoekvraag, niveau) die een embedding maakt van de zoekvraag
//                en met supabase.rpc() je SQL-functie aanroept, met een drempelwaarde en een maximum

// TODO (Les 13): maak een functie die je opgeslagen vacatures ophaalt voor de pagina /opgeslagen

// TODO (Les 13): maak een functie die met supabase.rpc() de vergelijkbare vacatures bij een vacature-id ophaalt
