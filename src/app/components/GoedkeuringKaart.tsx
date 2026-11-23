// Les 13 (kant-en-klare opmaak): kaart waarmee de gebruiker een tool die iets verandert goedkeurt of weigert
import type { ReactNode } from 'react';

type GoedkeuringKaartProps = {
    children: ReactNode;
    onGoedkeuren: () => void;
    onWeigeren: () => void;
};

export default function GoedkeuringKaart({ children, onGoedkeuren, onWeigeren }: GoedkeuringKaartProps) {
    return (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
            <div>{children}</div>
            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    onClick={onGoedkeuren}
                    className="rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-700"
                >
                    Opslaan
                </button>
                <button
                    type="button"
                    onClick={onWeigeren}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1 font-semibold text-gray-700 hover:bg-gray-100"
                >
                    Niet opslaan
                </button>
            </div>
        </div>
    );
}
