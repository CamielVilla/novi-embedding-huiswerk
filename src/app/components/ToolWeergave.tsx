// Les 12: één component dat per tool en per state laat zien wat er gebeurt (onderdeel 3 van het huiswerk)
import type { ChatAddToolApproveResponseFunction } from 'ai';
import type { ChatMessagePart } from '@/lib/chat/types';
// Les 13: kaart voor goedkeuring
import GoedkeuringKaart from '@/app/components/GoedkeuringKaart';
// TODO (Les 13): importeer OpgeslagenResultaten als je de case voor zoekOpgeslagenVacatures toevoegt
import VacatureKaart from '@/app/components/VacatureKaart';
import VacatureLijst from '@/app/components/VacatureLijst';

type ToolWeergaveProps = {
    part: ChatMessagePart;
    // Les 13: nodig om het opslaan goed te keuren of te weigeren
    addToolApprovalResponse: ChatAddToolApproveResponseFunction;
};

function Bezig({ tekst }: { tekst: string }) {
    return <p className="animate-pulse text-sm text-gray-500">{tekst}</p>;
}

function Fout({ tekst }: { tekst: string }) {
    return <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">{tekst}</p>;
}

export default function ToolWeergave({ part, addToolApprovalResponse }: ToolWeergaveProps) {
    switch (part.type) {
        case 'tool-zoekVacatures':
            if (part.state === 'output-available') return <VacatureLijst vacatures={part.output} />;
            if (part.state === 'output-error') return <Fout tekst="Het zoeken naar vacatures is mislukt." />;
            return <Bezig tekst={`Vacatures zoeken${part.input?.zoekwoord ? ` naar "${part.input.zoekwoord}"` : ''}...`} />;

        case 'tool-analyseerVacature':
            if (part.state === 'output-available') return <VacatureKaart vacature={part.output} />;
            if (part.state === 'output-error') return <Fout tekst="De vacature kon niet worden geanalyseerd." />;
            return <Bezig tekst="Vacature analyseren..." />;

        // Les 13: opslaan met goedkeuring, met een weergave voor elke state
        case 'tool-slaVacatureOp':
            if (part.state === 'approval-requested') {
                return (
                    <GoedkeuringKaart
                        onGoedkeuren={() => addToolApprovalResponse({ id: part.approval.id, approved: true })}
                        onWeigeren={() => addToolApprovalResponse({ id: part.approval.id, approved: false })}
                    >
                        Wil je de vacature <strong>{part.input.vacature.functietitel}</strong>
                        {part.input.vacature.bedrijf && <> bij {part.input.vacature.bedrijf}</>} opslaan?
                    </GoedkeuringKaart>
                );
            }
            if (part.state === 'approval-responded') {
                return <Bezig tekst={part.approval.approved ? 'Vacature opslaan...' : 'Opslaan geweigerd.'} />;
            }
            if (part.state === 'output-available') {
                return <p className="text-sm text-green-700">Vacature &quot;{part.output.functietitel}&quot; is opgeslagen.</p>;
            }
            if (part.state === 'output-denied') return <p className="text-sm text-gray-500">De vacature is niet opgeslagen.</p>;
            if (part.state === 'output-error') return <Fout tekst="De vacature kon niet worden opgeslagen." />;
            return <Bezig tekst="Opslaan voorbereiden..." />;

        // TODO (Les 13): voeg een case toe voor 'tool-zoekOpgeslagenVacatures' met <OpgeslagenResultaten resultaten={part.output} />

        default:
            return null;
    }
}
