import { tool } from 'ai';
import { z } from 'zod';
import parseHTML from "@/lib/helpers/htmlParser";


const ADZUNA_URL = 'https://api.adzuna.com/v1/api/jobs/nl/search/1';
const TIMEOUT_MS = 5000;

const adzunaResponseSchema = z.object({
    results: z.array(
        z.object({
            id: z.string(),
            title: z.string(),
            company: z.object({ display_name: z.string().optional() }).optional(),
            location: z.object({ display_name: z.string().optional() }).optional(),
            salary_min: z.number().optional(),
            salary_max: z.number().optional(),
            salary_is_predicted: z.union([z.string(), z.number()]).optional(),
            created: z.string().optional(),
            redirect_url: z.string(),
        }),
    ),
});


export const zoekVacatures = tool({
    description:
        'Zoek actuele vacatures in Nederland op functie of vaardigheid, eventueel in een bepaalde plaats. Gebruik deze tool altijd als de gebruiker naar bestaande of openstaande vacatures vraagt.',
    inputSchema: z.object({
        zoekwoord: z.string().describe('Functie of vaardigheid om op te zoeken, bijvoorbeeld "react developer" of "data analist"'),
        plaats: z.string().nullable().describe('Plaats in Nederland, bijvoorbeeld "Utrecht", of null als de gebruiker geen plaats noemt'),
    }),
    execute: async ({ zoekwoord, plaats }) => {
        const appId = process.env.ADZUNA_APP_ID;
        const appKey = process.env.ADZUNA_APP_KEY;

        // Les 12: technische details alleen loggen op de server. De foutmelding die het model krijgt, bevat geen keys of URL's.
        if (!appId || !appKey) {
            console.error('ADZUNA_APP_ID of ADZUNA_APP_KEY ontbreekt in .env.local');
            throw new Error('Zoeken naar vacatures is op dit moment niet beschikbaar.');
        }

        // Les 12: URLSearchParams zorgt dat zoekwoorden met spaties of een & de URL niet breken
        const params = new URLSearchParams({
            app_id: appId,
            app_key: appKey,
            what: zoekwoord,
            results_per_page: '5',
            'content-type': 'application/json',
        });
        if (plaats) params.set('where', plaats);

        let response: Response;
        try {
            // Les 12: na 5 seconden breken we de request af, zodat de chat niet blijft hangen
            response = await fetch(`${ADZUNA_URL}?${params}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
        } catch (error) {
            console.error('Adzuna is niet bereikbaar:', error instanceof Error ? error.name : 'onbekende fout');
            throw new Error('De vacaturedienst reageert nu niet. Probeer het later opnieuw.');
        }

        if (!response.ok) {
            console.error(`Adzuna gaf status ${response.status}`);
            throw new Error('Het zoeken naar vacatures is mislukt.');
        }

        const resultaat = adzunaResponseSchema.safeParse(await response.json());
        if (!resultaat.success) {
            console.error('Onverwachte response van Adzuna:', resultaat.error.issues);
            throw new Error('De vacaturedienst gaf een onverwacht antwoord.');
        }

        // Les 12: alleen de velden teruggeven die het model en de chat nodig hebben. Elk veld kost tokens.
        return resultaat.data.results.map((v) => ({
            id: v.id,
            titel: parseHTML(v.title),
            bedrijf: v.company?.display_name ?? null,
            plaats: v.location?.display_name ?? null,
            salarisMin: v.salary_min ?? null,
            salarisMax: v.salary_max ?? null,
            salarisIsSchatting: String(v.salary_is_predicted) === '1',
            geplaatstOp: v.created ?? null,
            url: v.redirect_url,
        }));
    },
    // Les 12: het model krijgt de vacatures zonder links. De links staan al klikbaar in de kaartjes in de chat,
    // zo zet het model ze niet nog een keer als platte, niet-klikbare tekst in zijn antwoord.
    // Oudere berichten in de chatgeschiedenis kunnen een leeg of afwijkend resultaat hebben, daarom eerst de Array.isArray-check.
    toModelOutput: ({ output }) => ({
        type: 'json',
        value: (Array.isArray(output) ? output : []).map((vacature) => ({
            titel: vacature.titel,
            bedrijf: vacature.bedrijf,
            plaats: vacature.plaats,
            salarisMin: vacature.salarisMin,
            salarisMax: vacature.salarisMax,
            salarisIsSchatting: vacature.salarisIsSchatting,
        })),
    }),
});
