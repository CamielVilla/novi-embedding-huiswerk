import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  generateId,
  // Les 12: isStepCount voor multi-step calls
  isStepCount,
  // Les 12: hasToolCall om te stoppen na zoekVacatures, zodat alleen de kaartjes in de chat staan
  hasToolCall,
  streamText,
  toUIMessageStream,
} from 'ai';
import {saveChat} from "@/lib/chat/cruds";
// Les 12: getypeerde berichten en de tools
import type { ChatMessage } from '@/lib/chat/types';
import { tools } from '@/lib/tools';

export async function POST(request: Request) {
  // Les 12: instructies aangepast, zodat de assistent ook vacatures mag zoeken en de tools op de juiste manier gebruikt
  // TODO (Les 13): beschrijf in de instructies wanneer het model zoekOpgeslagenVacatures gebruikt
  const CONTEXT = `Je bent een docent die studenten helpt met vragen over webdevelopment en met het vinden en beoordelen van vacatures. Zeg bij vragen over code geen oplossingen voor, maar stuur gebruikers in de goede richting.
Gebruik zoekVacatures als de gebruiker naar openstaande vacatures vraagt, en verzin nooit zelf vacatures, aantallen of salarissen. Vraag door als niet duidelijk is naar welke functie of vaardigheid de gebruiker zoekt.
Gebruik analyseerVacature elke keer als de gebruiker een vacaturetekst plakt, ook als een eerdere analyse in het gesprek is mislukt.
Roep direct na een geslaagde analyseerVacature slaVacatureOp aan met de geanalyseerde vacature, zodat de gebruiker het opslaan kan goedkeuren. Als slaVacatureOp niet wordt goedgekeurd, probeer die tool dan niet opnieuw.
Als een tool een fout geeft, leg dat kort uit zonder technische details.
Antwoord in het Nederlands in maximaal 5 zinnen. Schrijf geen tekst als je zoekVacatures, analyseerVacature of slaVacatureOp gebruikt, de resultaten verschijnen al als kaartjes in de chat. Na het opslaan of weigeren schrijf je hooguit één korte zin, zonder de gegevens van de vacature te herhalen. Noem ook bij de andere tools geen titels, links of opsommingen van vacatures, maar geef hooguit een korte samenvatting of stel een vervolgvraag.`
  const TEMPERATURE = 0.7
  const MAX_OUTPUT_TOKENS = 500
  // Les 12: maximaal aantal stappen per vraag, zodat het model niet eindeloos tools blijft aanroepen
  const MAX_STAPPEN = 5

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'OPENAI_API_KEY ontbreekt. Zet deze in .env.local.' },
      { status: 500 },
    );
  }

  try {
    // Les 12: ChatMessage in plaats van UIMessage
    const { id, messages }: {id: string, messages: ChatMessage[] } = await request.json();

    const recentMessages = messages.slice(-10);

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: await convertToModelMessages(recentMessages, { tools }),
      instructions: CONTEXT,
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      tools,
      toolApproval: {
        slaVacatureOp: 'user-approval',
      },
      // Les 13: slaVacatureOp mag alleen direct na een geslaagde analyse worden aangeroepen.
      // Zo ziet de gebruiker eerst de vacaturekaart, en pas daarna de vraag of de vacature mag worden opgeslagen.
      prepareStep: ({ steps }) => {
        const vorigeStap = steps.at(-1);
        const analyseGelukt = vorigeStap?.toolResults.some((resultaat) => resultaat.toolName === 'analyseerVacature');

        if (analyseGelukt) {
          // Na de analyse moet het model slaVacatureOp aanroepen, en kan het niets anders doen
          return { toolChoice: { type: 'tool', toolName: 'slaVacatureOp' }, activeTools: ['slaVacatureOp'] };
        }

        // In alle andere stappen is slaVacatureOp niet beschikbaar
        // TODO (Les 13): voeg zoekOpgeslagenVacatures toe aan activeTools als je die tool hebt gemaakt
        return { activeTools: ['zoekVacatures', 'analyseerVacature'] };
      },
      // Les 12: stop na maximaal MAX_STAPPEN stappen, of meteen nadat zoekVacatures is uitgevoerd.
      // Zo schrijft het model na de zoekresultaten geen tekst meer en staan alleen de kaartjes in de chat.
      stopWhen: [isStepCount(MAX_STAPPEN), hasToolCall('zoekVacatures')],
      onEnd: ({usage}) => {
        console.log("Input: ", usage.inputTokens)
        console.log("Output: ", usage.outputTokens)
      }
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        originalMessages: messages,
        generateMessageId: generateId,
        // Deze melding ziet de gebruiker ook als errorText bij een tool die een fout gooit
        onError: (error) => {
          console.error('Fout bij OpenAI of in een tool:', error);
          return 'Er ging iets mis bij het ophalen van een antwoord.';
        },
        onEnd: async ( { messages } ) => {
          try {
            await saveChat(id, messages)
          } catch (error) {
            console.error('Fout bij opslaan van chat:', error);
          }
        }
      }),
    });
  } catch (error) {
    console.error('Fout in /api/chat:', error);
    return Response.json({ error: 'Er ging iets mis.' }, { status: 500 });
  }
}
