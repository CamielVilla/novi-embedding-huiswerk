// Les 13: de controles uit Les 11 in een eigen bestand, zodat zowel de Server Action als de tool slaVacatureOp ze gebruikt
import type { Vacature } from '@/lib/vacature/schema';

export const MAX_LENGTE = 10000;

export function controleerTekst(tekst: string): string | null {
    if (!tekst) return 'Plak eerst een vacaturetekst.';
    if (tekst.length > MAX_LENGTE) return `De tekst is te lang (maximaal ${MAX_LENGTE} tekens).`;
    return null;
}

export function controleerVacature(vacature: Vacature): string | null {
    if (vacature.salarisMin !== null && vacature.salarisMax !== null && vacature.salarisMin > vacature.salarisMax) {
        return 'Het salaris lijkt niet te kloppen: het minimum is hoger dan het maximum.';
    }
    return null;
}
