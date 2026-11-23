## Opdrachtbeschrijving

In de vorige opdracht kon je chatbot actuele data ophalen en een tekst analyseren. In deze opdracht ga je die resultaten opslaan vanuit de chat, en daarna op betekenis zoeken in alles wat je hebt opgeslagen. Zoeken op betekenis betekent dat "frontend developer" ook een opgeslagen vacature voor een "React-ontwikkelaar" vindt, terwijl die woorden nergens overeenkomen.

Je bouwt verder op je chatbotproject uit de vorige opdracht en werkt verder met je eigen onderwerp uit Les 11. Eerst bouw je een tool die opslaat, maar pas nadat de gebruiker daar toestemming voor geeft. Daarna maak je bij het opslaan een embedding van elk resultaat, zet je die in Supabase met pgvector, en bouw je een tool waarmee het model op betekenis in de opgeslagen data kan zoeken.

Gebruik de officiële documentatie als uitgangspunt:

- [Vercel AI SDK-documentatie: Embeddings](https://ai-sdk.dev/docs/ai-sdk-core/embeddings)
- [Vercel AI SDK-documentatie: Tool Execution Approval](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage#tool-execution-approval)
- [Vercel AI SDK-documentatie: Loop Control](https://ai-sdk.dev/docs/agents/loop-control)
- [Supabase-documentatie: Vector columns](https://supabase.com/docs/guides/ai/vector-columns) en [pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)

Probeer niet alleen de code werkend te krijgen, maar ook te begrijpen wat je doet. Kom je dingen tegen die je niet begrijpt? Zoek direct op wat het is en wat het doet.

### 1. Opslaan vanuit de chat met goedkeuring

Bouw een tool die een resultaat opslaat in je Supabase-tabel uit Les 11, bijvoorbeeld `slaVacatureOp` of `slaReceptOp`. Gebruik je schema uit Les 11 als (deel van) het `inputSchema` van de tool, en hergebruik de functie uit Les 11 die opslaat in de database. Stel met `toolApproval` in `streamText()` in dat deze tool goedkeuring van de gebruiker nodig heeft.

Het opslaan hoort direct bij het analyseren. Zodra je analysetool uit Les 12 een tekst heeft geanalyseerd, ziet de gebruiker eerst het resultaat en daarna meteen de vraag of het mag worden opgeslagen.

In het startproject van deze les zit dit onderdeel voor vacatures al kant-en-klaar, en in de les is de code doorgenomen. Werk je aan je eigen onderwerp, bouw het dan op dezelfde manier na en gebruik de code uit het startproject als voorbeeld. Kopieer niet alleen, maar zorg dat je elke regel kunt uitleggen.

Zorg ervoor dat je applicatie minimaal aan de volgende eisen voldoet:

- Direct na een geslaagde analyse verschijnt eerst het resultaat van je analysetool, en daarna de vraag of het mag worden opgeslagen. De gebruiker hoeft daar niet zelf om te vragen, en het model schrijft er geen tekst tussen.
- Het model kan de tool die opslaat alleen aanroepen direct na een geslaagde analyse.
- De tool die opslaat, wordt pas uitgevoerd nadat de gebruiker in de chat op een knop heeft geklikt om het goed te keuren.
- De gebruiker kan het opslaan ook weigeren. Het model probeert een geweigerde tool daarna niet opnieuw.
- Na goedkeuring of weigering gaat het gesprek vanzelf verder, zonder dat de gebruiker een nieuw bericht hoeft te sturen.
- In `execute` voer je dezelfde controles uit als in Les 11, zoals je inputcontrole en je logische controle. Het model vult het object nu zelf in, dus die controles worden anders overgeslagen.
- Elke state van de tool krijgt een eigen weergave in de chat, ook `approval-requested`, `output-available`, `output-denied` en `output-error`.

<details>
<summary>Loop je vast? 🔍</summary>

- Bij een tool die goedkeuring nodig heeft, krijgt het part de state `approval-requested`. Met `addToolApprovalResponse` uit `useChat` geef je het antwoord van de gebruiker door.
- Kijk in de documentatie naar de optie `sendAutomaticallyWhen` van `useChat` en de helper `lastAssistantMessageIsCompleteWithApprovalResponses`.
- Zet in je instructies dat het model een afgewezen tool niet opnieuw mag proberen.
- Met `prepareStep` in `streamText()` stel je per stap in welke tools het model mag gebruiken (`activeTools`) en welke tool het moet aanroepen (`toolChoice`). In `steps` zie je wat er in de vorige stappen is gebeurd, bijvoorbeeld in `toolResults`.
- Zet de oorspronkelijke tekst niet in het `inputSchema` van je opslaantool. Het model moet die tekst dan helemaal overtypen, en bij een lange tekst wordt die afgekapt door `maxOutputTokens`. Het tweede argument van `execute` bevat de `messages`, en daarin staat het bericht van de gebruiker.
</details>

> **Beantwoord de volgende vragen voordat je verdergaat:**
>
> 1. Welke van je tools hebben goedkeuring nodig, en welke niet? Waarom?
> 2. Waarom voer je de controles uit Les 11 opnieuw uit in `execute`, terwijl de gebruiker het opslaan al goedkeurt?
> 3. Welke states doorloopt het tool-part van je opslaantool als de gebruiker op "Opslaan" klikt? En als hij weigert?
> 4. Waarom regel je met `prepareStep` dat er na de analyse om goedkeuring wordt gevraagd, en zet je dat niet alleen in je instructies?

### 2. Maak embeddings en sla ze op

Zet in de SQL Editor van Supabase de extensie `vector` aan en voeg aan je tabel uit Les 11 een kolom toe voor embeddings. Breid daarna de functie die opslaat uit, zodat er bij het opslaan meteen een embedding wordt gemaakt met `embed()`.

Bedenk goed wat je embedt. Alleen een titel? Ook andere velden uit je schema? Of de hele oorspronkelijke tekst? Die keuze bepaalt wat je straks terugvindt.

Rijen die je al eerder hebt opgeslagen, hebben nog geen embedding. Schrijf daarom een klein script of een tijdelijke Route Handler die met `embedMany()` de embeddings voor die rijen in één keer berekent en opslaat.

Zorg ervoor dat je applicatie minimaal aan de volgende eisen voldoet:

- De kolom heeft precies het aantal dimensies van het model dat je gebruikt, bijvoorbeeld `vector(1536)` voor `text-embedding-3-small`.
- Elk nieuw opgeslagen resultaat krijgt meteen een embedding.
- De tekst die je embedt, stel je samen in een aparte functie, zodat je die keuze op één plek kunt aanpassen.
- Alle bestaande rijen hebben na het draaien van je script een embedding.
- Je maakt embeddings alleen op de server, met de API-key uit `.env.local`.

<details>
<summary>Loop je vast? 🔍</summary>

- De extensie zet je aan met `create extension if not exists vector with schema extensions;`.
- In de gegenereerde types van Supabase staat een vector-kolom als `string`. Geef de embedding bij het opslaan daarom mee als `JSON.stringify(embedding)`.
- Werk na het toevoegen van de kolom je types bij, net als in Les 7.
- Met `.is('embedding', null)` haal je alle rijen op die nog geen embedding hebben.
</details>

> **Beantwoord daarna de volgende vragen:**
>
> 1. Wat is een embedding, in je eigen woorden? Waarom liggen teksten met een vergelijkbare betekenis dicht bij elkaar?
> 2. Welke velden neem je op in de tekst die je embedt, en waarom? Wat zou er veranderen als je de hele oorspronkelijke tekst zou embedden?
> 3. Waarom gebruik je voor de bestaande rijen `embedMany()` en niet voor elke rij apart `embed()`?

### 3. Zoek op betekenis

Schrijf in Supabase een SQL-functie die op betekenis zoekt, bijvoorbeeld `match_vacatures` of `match_recepten`. Roep die functie aan vanaf de server met `supabase.rpc()`, met een embedding van de zoekvraag van de gebruiker.

Zorg ervoor dat je applicatie minimaal aan de volgende eisen voldoet:

- De functie gebruikt de cosine distance (`<=>`) en geeft per resultaat ook de similarity terug.
- De functie heeft een drempelwaarde en een maximum aantal resultaten.
- De functie heeft minimaal één gewoon filter naast het zoeken op betekenis, zoals niveau, categorie of vegetarisch. Dit heet hybride zoeken.
- Rijen zonder embedding doen niet mee.
- De drempelwaarde heb je gekozen door te testen met echte zoekvragen, niet door te gokken.
- De functie wordt alleen vanaf de server aangeroepen.

<details>
<summary>Inspiratie nodig? ✨</summary>

- Kijk in de Supabase-documentatie over vector columns naar de voorbeeldfunctie `match_documents`. Die kun je aanpassen aan je eigen tabel.
- `1 - (embedding <=> query_embedding)` geeft de similarity, net als `cosineSimilarity()` in de AI SDK.
- Een filter dat ook leeg mag zijn, schrijf je bijvoorbeeld als `(filter_niveau is null or niveau = filter_niveau)`.
</details>

> **Beantwoord daarna de volgende vragen:**
>
> 1. Welke drempelwaarde heb je gekozen, en hoe ben je daarop gekomen?
> 2. Waarom kun je voor zoeken op betekenis niet gewoon `.from('vacatures').select()` gebruiken, maar heb je een SQL-functie nodig?
> 3. Wanneer is zoeken op woorden, zoals met `ILIKE`, juist beter dan zoeken op betekenis? Geef een voorbeeld uit je eigen applicatie.

### 4. Zoeken als tool en vergelijkbare items

Maak van het zoeken een tool, bijvoorbeeld `zoekOpgeslagenVacatures`, zodat het model zelf op betekenis in de opgeslagen data kan zoeken. Toon de resultaten in de chat, net als bij je andere tools.

Bouw daarnaast een manier om bij een opgeslagen resultaat de meest vergelijkbare resultaten te tonen. Hoe je dit vormgeeft, kies je zelf. Je kunt bijvoorbeeld een aparte pagina maken met je opgeslagen resultaten en per item "vergelijkbare items" tonen, of een tweede tool maken die het model in de chat kan gebruiken.

Zorg ervoor dat je applicatie minimaal aan de volgende eisen voldoet:

- Je chatroute heeft een tool die op betekenis zoekt in je opgeslagen data. Deze tool heeft geen goedkeuring nodig.
- De resultaten verschijnen in de chat met een eigen weergave, inclusief een melding als er niets is gevonden.
- Bij een opgeslagen resultaat kan de gebruiker vergelijkbare resultaten zien.
- Voor vergelijkbare resultaten gebruik je de embedding die al in de database staat. Je maakt daarvoor geen nieuwe embedding.

> **Beantwoord daarna de volgende vragen:**
>
> 1. Hoe heb je de description van je zoektool geschreven, zodat het model hem niet verwart met de tool uit Les 12 die een externe API aanroept?
> 2. Waarom heb je voor vergelijkbare resultaten geen nieuwe embedding nodig?
> 3. Voor welke vorm heb je gekozen voor vergelijkbare resultaten, en waarom past die bij jouw applicatie?

### 5. Test je applicatie en ontdek de valkuilen

Zoeken op betekenis werkt niet altijd zoals je verwacht. Test jouw applicatie daarom met minimaal vijf zoekvragen:

- **Een synoniem:** zoek met andere woorden dan er in je data staan, bijvoorbeeld "frontend" terwijl er "React" staat.
- **Dezelfde woorden, andere betekenis:** een zoekvraag die woorden deelt met je data, maar over iets anders gaat.
- **Een andere taal:** zoek in het Engels terwijl je data Nederlands is, of andersom.
- **Een heel korte zoekvraag:** één woord.
- **Iets wat niet bestaat:** een zoekvraag waarvoor in je data echt niets relevants staat.

Noteer per zoekvraag wat je applicatie teruggaf, met de similarity, en of dat klopte. Pas daarna je drempelwaarde of je embedding-tekst aan op basis van wat je ziet, en test opnieuw.

<details>
<summary>Extra uitdaging 🚀</summary>

Combineer zoeken op woorden en zoeken op betekenis in één functie. Zoek uit hoe full-text search in Postgres werkt (`to_tsvector` en `to_tsquery`), en bedenk hoe je de score van beide manieren van zoeken samenvoegt tot één ranking. Test of je resultaten daardoor beter worden dan met alleen zoeken op betekenis.
</details>

> **Beantwoord daarna de volgende vragen:**
>
> 1. Wat gaf je applicatie terug bij de zoekvraag waarvoor niets relevants bestond? Wat zegt dat over je drempelwaarde?
> 2. Stel dat je later overstapt op een ander embeddingmodel. Wat moet je dan doen met de embeddings die al in je database staan, en waarom?
> 3. De tekst die je embedt, gaat naar OpenAI. Welke gegevens uit je applicatie zou je daarom niet zomaar embedden?

### Inleveren

Lever de link naar de repository in met jouw werkende Next.js-applicatie. In de `README.md` staan jouw antwoorden op de reflectievragen, je SQL-functie, de drempelwaarde die je hebt gekozen en je testresultaten uit onderdeel 5.

**Let op:** lever je API-keys nooit in. Dit geldt voor je OpenAI API-key, je Supabase secret key en de key van je externe API. Neem deze niet op in je broncode, README.md, screenshots of Git-repository. De applicatie moet de sleutels uit `.env.local` lezen.
