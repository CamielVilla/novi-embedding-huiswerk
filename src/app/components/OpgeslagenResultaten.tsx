// Les 13 (kant-en-klare opmaak): lijst met opgeslagen vacatures uit een zoekopdracht op betekenis, met de similarity als percentage
export type OpgeslagenResultaat = {
    id: string;
    functietitel: string;
    bedrijf: string | null;
    niveau: string;
    similarity: number;
};

export default function OpgeslagenResultaten({ resultaten }: { resultaten: OpgeslagenResultaat[] }) {
    if (resultaten.length === 0) {
        return <p className="text-sm text-gray-500">Geen opgeslagen vacatures gevonden die hierop lijken.</p>;
    }

    return (
        <ul className="space-y-2">
            {resultaten.map((resultaat) => (
                <li key={resultaat.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm">
                    <div>
                        <p className="font-semibold">{resultaat.functietitel}</p>
                        <p className="text-gray-600">
                            {resultaat.bedrijf ?? 'Onbekend bedrijf'} · {resultaat.niveau}
                        </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {Math.round(resultaat.similarity * 100)}% match
                    </span>
                </li>
            ))}
        </ul>
    );
}
