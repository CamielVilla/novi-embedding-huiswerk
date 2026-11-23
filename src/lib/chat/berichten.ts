// Les 13: hulpfunctie die zowel analyseerVacature als slaVacatureOp gebruikt
import type { ModelMessage, UserModelMessage } from 'ai';

// Haalt de tekst uit het laatste bericht van de gebruiker.
// Zo hoeft het model een lange vacaturetekst niet over te typen als input van een tool. Dat kost veel output-tokens,
// en bij een lange tekst wordt die input afgekapt door maxOutputTokens, waarna de tool een JSON-fout geeft.
export function laatsteGebruikersTekst(messages: ModelMessage[]): string {
    const laatste = messages.findLast((message): message is UserModelMessage => message.role === 'user');

    if (!laatste) {
        return '';
    }

    if (typeof laatste.content === 'string') {
        return laatste.content;
    }

    return laatste.content
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join('\n');
}
