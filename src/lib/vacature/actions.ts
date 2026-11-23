'use server'

import { openai } from '@ai-sdk/openai';
import { generateText, NoObjectGeneratedError, Output } from 'ai';
import { vacatureSchema, type Vacature } from '@/lib/vacature/schema';
// Les 13: controles komen uit een gedeeld bestand, zodat de tool slaVacatureOp dezelfde controles gebruikt
import { controleerTekst, controleerVacature } from '@/lib/vacature/controles';

export type VacatureResultaat = {
  vacature?: Vacature;
  error?: string;
};

export async function extractVacature(tekst: string): Promise<VacatureResultaat> {
  const schoneTekst = tekst.trim();

  // Les 13: inputcontrole via de gedeelde functie
  const tekstFout = controleerTekst(schoneTekst);
  if (tekstFout) {
    return { error: tekstFout };
  }

  try {
    const { output } = await generateText({
      model: openai('gpt-4o-mini'),
      instructions: 'Haal de gegevens uit de vacaturetekst. Gebruik alleen informatie die in de tekst staat.',
      prompt: schoneTekst,
      temperature: 0,
      output: Output.object({ schema: vacatureSchema }),
    });

    // Les 13: logische controle via de gedeelde functie
    const vacatureFout = controleerVacature(output);
    if (vacatureFout) {
      return { error: vacatureFout };
    }

    return { vacature: output };
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error('Geen geldig vacature-object:', error.text);
      return { error: 'Het model gaf geen bruikbaar resultaat. Probeer het opnieuw.' };
    }

    console.error('Fout bij analyseren van vacature:', error);
    return { error: 'Er ging iets mis bij het analyseren van de vacature.' };
  }
}
