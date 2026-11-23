// Les 13 (kant-en-klare opmaak): pagina met de opgeslagen vacatures, met per vacature de vergelijkbare vacatures
import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import VergelijkbareLijst from '@/app/components/VergelijkbareLijst';
import type { OpgeslagenResultaat } from '@/app/components/OpgeslagenResultaten';

type OpgeslagenVacature = {
    id: string;
    functietitel: string;
    bedrijf: string | null;
    niveau: string;
    vaardigheden: string[];
};

export default function OpgeslagenPagina() {
    return (
        <main className="mx-auto w-full max-w-2xl p-4">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Opgeslagen vacatures</h1>
                <Link href="/" className="text-sm font-semibold text-blue-700 underline">
                    Terug naar de chat
                </Link>
            </div>
            <Suspense fallback={<p className="text-gray-400">Vacatures laden...</p>}>
                <OpgeslagenLijst />
            </Suspense>
        </main>
    );
}

async function OpgeslagenLijst() {
    await connection();

    // TODO: haal hier je opgeslagen vacatures op uit Supabase, met een functie uit src/lib/vacature/cruds.ts
    const vacatures: OpgeslagenVacature[] = [];

    if (vacatures.length === 0) {
        return <p className="text-gray-500">Je hebt nog geen vacatures opgeslagen.</p>;
    }

    return (
        <ul className="space-y-3">
            {vacatures.map((vacature) => (
                <li key={vacature.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="font-semibold">{vacature.functietitel}</p>
                    <p className="text-sm text-gray-600">
                        {vacature.bedrijf ?? 'Onbekend bedrijf'} · {vacature.niveau}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{vacature.vaardigheden.join(', ')}</p>
                    <div className="mt-3 border-t border-gray-100 pt-2">
                        <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Vergelijkbaar</p>
                        <Suspense fallback={<p className="text-xs text-gray-400">Zoeken...</p>}>
                            <Vergelijkbaar vacatureId={vacature.id} />
                        </Suspense>
                    </div>
                </li>
            ))}
        </ul>
    );
}

async function Vergelijkbaar({ vacatureId }: { vacatureId: string }) {
    // TODO: haal de vergelijkbare vacatures op met je SQL-functie, op basis van de embedding die al in de database staat
    const vergelijkbaar: OpgeslagenResultaat[] = [];

    return (
        <div data-vacature-id={vacatureId}>
            <VergelijkbareLijst vacatures={vergelijkbaar} />
        </div>
    );
}
