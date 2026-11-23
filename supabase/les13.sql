-- Les 13: schrijf hier de SQL voor deze les en voer die uit in de SQL Editor van Supabase.
-- Staat de tabel vacatures uit Les 11 nog niet in je Supabase-project? Voer dan eerst supabase/vacatures.sql uit.

-- TODO: zet de extensie vector aan (in het schema extensions)

-- TODO: voeg aan je tabel een kolom embedding toe met het juiste aantal dimensies voor je model,
--       bijvoorbeeld extensions.vector(1536) voor text-embedding-3-small

-- TODO: schrijf een functie die op betekenis zoekt, bijvoorbeeld match_vacatures, met:
--       - de embedding van de zoekvraag, een drempelwaarde en een maximum aantal resultaten
--       - minimaal één gewoon filter, zoals niveau (hybride zoeken)
--       - de similarity per resultaat: 1 - (embedding <=> query_embedding)
--       - alleen rijen die een embedding hebben

-- TODO: schrijf een functie die bij een opgeslagen rij de meest vergelijkbare rijen teruggeeft,
--       op basis van de embedding die al in de database staat
