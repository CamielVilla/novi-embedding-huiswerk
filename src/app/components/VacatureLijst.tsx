// Les 12: weergave van de zoekresultaten van de tool zoekVacatures, met de bronvermelding die Adzuna vraagt
import type { ChatMessagePart } from '@/lib/chat/types';

type Zoekresultaat = Extract<ChatMessagePart, { type: 'tool-zoekVacatures'; state: 'output-available' }>['output'];

function formatSalaris(min: number | null, max: number | null) {
    const euro = (bedrag: number) => `€ ${Math.round(bedrag).toLocaleString('nl-NL')}`;
    if (min !== null && max !== null && min !== max) return `${euro(min)} - ${euro(max)}`;
    if (min !== null) return euro(min);
    if (max !== null) return euro(max);
    return 'Niet vermeld';
}

export default function VacatureLijst({ vacatures }: { vacatures: Zoekresultaat }) {
    if (!vacatures?.length) {
        return <p className="text-sm text-gray-500">Geen vacatures gevonden.</p>;
    }

    return (
        <div className="space-y-2">
            <ul className="space-y-2">
                {/* Les 12: id plus index als key, zodat de key ook uniek is als Adzuna een vacature dubbel teruggeeft of een oud bericht geen id heeft */}
                {vacatures.map((vacature, index) => (
                    <li key={`${vacature.id}-${index}`} className="rounded-lg border border-gray-200 bg-white p-3">
                        <a
                            href={vacature.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-700 underline"
                        >
                            {vacature.titel}
                        </a>
                        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                            <dt className="font-semibold">Bedrijf</dt>
                            <dd>{vacature.bedrijf ?? 'Onbekend'}</dd>
                            <dt className="font-semibold">Plaats</dt>
                            <dd>{vacature.plaats ?? 'Onbekend'}</dd>
                            <dt className="font-semibold">Salaris</dt>
                            <dd>
                                {formatSalaris(vacature.salarisMin, vacature.salarisMax)}
                                {vacature.salarisIsSchatting && ' (schatting van Adzuna)'}
                            </dd>
                        </dl>
                    </li>
                ))}
            </ul>
            {/* Les 12: bronvermelding, een voorwaarde voor het gebruik van de Adzuna API */}
            <p className="text-xs text-gray-500">
                Vacatures via{' '}
                <a href="https://www.adzuna.nl" target="_blank" rel="noopener noreferrer" className="underline">
                    Adzuna
                </a>
            </p>
        </div>
    );
}
