// Les 13 (kant-en-klare opmaak): compacte lijst met vergelijkbare vacatures bij een opgeslagen vacature
import type { OpgeslagenResultaat } from '@/app/components/OpgeslagenResultaten';

export default function VergelijkbareLijst({ vacatures }: { vacatures: OpgeslagenResultaat[] }) {
    if (vacatures.length === 0) {
        return <p className="text-xs text-gray-400">Nog geen vergelijkbare vacatures.</p>;
    }

    return (
        <ul className="space-y-1 text-xs text-gray-600">
            {vacatures.map((vacature) => (
                <li key={vacature.id} className="flex justify-between gap-2">
                    <span>
                        {vacature.functietitel}
                        {vacature.bedrijf && <> · {vacature.bedrijf}</>}
                    </span>
                    <span className="shrink-0 font-semibold text-blue-700">{Math.round(vacature.similarity * 100)}%</span>
                </li>
            ))}
        </ul>
    );
}
