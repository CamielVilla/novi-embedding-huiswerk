// Les 12: alle tools in één object. De route geeft dit object aan streamText(), en de client leidt er de types van af.
import { analyseerVacature } from '@/lib/tools/analyseerVacature';
import { zoekVacatures } from '@/lib/tools/zoekVacatures';

// Les 13: opslaan met goedkeuring
import { slaVacatureOp } from '@/lib/tools/slaVacatureOp';
// TODO (Les 13): importeer zoekOpgeslagenVacatures en voeg die hieronder toe
export const tools = {
    zoekVacatures,
    analyseerVacature,
    slaVacatureOp,
};
