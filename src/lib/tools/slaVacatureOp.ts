// Les 13: tool die een vacature opslaat. Goedkeuring van de gebruiker staat in de route via toolApproval.
import { tool } from 'ai';
import { z } from 'zod';
import { laatsteGebruikersTekst } from '@/lib/chat/berichten';
import { controleerTekst, controleerVacature } from '@/lib/vacature/controles';
import { saveVacature } from '@/lib/vacature/cruds';
import { vacatureSchema } from '@/lib/vacature/schema';

export const slaVacatureOp = tool({
    description:
        'Sla de vacature die net met analyseerVacature is geanalyseerd op in de database. De gebruiker keurt het opslaan eerst goed of af.',
    // Het schema uit Les 11 is hier direct de input van de tool.
    // Les 13: de oorspronkelijke tekst is geen input, want dan moet het model die lange tekst helemaal overtypen.
    inputSchema: z.object({
        vacature: vacatureSchema,
    }),
    // Les 13: execute draait pas na goedkeuring. De oorspronkelijke tekst komt uit het laatste bericht van de gebruiker.
    execute: async ({ vacature }, { messages }) => {
        const tekst = laatsteGebruikersTekst(messages).trim();

        // Het model vult het vacature-object zelf in, dus de controles uit Les 11 voeren we hier opnieuw uit
        const fout = controleerTekst(tekst) ?? controleerVacature(vacature);
        if (fout) {
            throw new Error(fout);
        }

        try {
            await saveVacature(vacature, tekst);
        } catch (error) {
            console.error('Fout bij opslaan van vacature:', error);
            throw new Error('De vacature kon niet worden opgeslagen.');
        }

        return { opgeslagen: true, functietitel: vacature.functietitel };
    },
});
