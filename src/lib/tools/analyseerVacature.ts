// Les 12: de vacature-analyse uit Les 11 als tool (onderdeel 2 van het huiswerk). De functie uit Les 11 wordt hergebruikt.
import { tool } from 'ai';
import { z } from 'zod';
import { extractVacature } from '@/lib/vacature/actions';
// Les 13: de hulpfunctie staat nu in een eigen bestand, zodat slaVacatureOp hem ook kan gebruiken
import { laatsteGebruikersTekst } from '@/lib/chat/berichten';

export const analyseerVacature = tool({
    description:
        'Analyseer de vacaturetekst die de gebruiker in zijn laatste bericht heeft geplakt en haal de belangrijkste gegevens eruit. De tool leest de tekst zelf uit dat bericht, je hoeft geen tekst mee te geven. Niet gebruiken voor het zoeken naar vacatures.',
    // Les 12: geen input van het model nodig, de tekst komt uit het bericht van de gebruiker
    inputSchema: z.object({}),
    // Les 12: het tweede argument van execute bevat onder andere de berichten die naar het model zijn gestuurd
    execute: async (_input, { messages }) => {
        const tekst = laatsteGebruikersTekst(messages);

        // Een tool mag zelf ook weer een model aanroepen: extractVacature gebruikt generateText() met Output.object()
        const resultaat = await extractVacature(tekst);

        // Les 12: de foutmeldingen uit extractVacature zijn al begrijpelijk en bevatten geen technische details
        if (!resultaat.vacature) {
            throw new Error(resultaat.error ?? 'De vacature kon niet worden geanalyseerd.');
        }

        return resultaat.vacature;
    },
});
