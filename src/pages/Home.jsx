import { useEffect, useState } from 'react';
import CharacterPlanPanel from '@/components/home/CharacterPlanPanel';
import ScreenSequencesTable from '@/components/home/ScreenSequencesTable';
import DataStatus from '@/components/DataStatus';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCharacters } from '@/hooks/useCharacters';

export default function Home() {
  const { characters, loading, error } = useCharacters();
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);

  useEffect(() => {
    if (characters.length === 0) return;

    setSelectedCharacterId((current) => {
      if (current && characters.some((character) => character.id === current)) {
        return current;
      }
      return characters[0].id;
    });
  }, [characters]);

  const selectedCharacter = characters.find((character) => character.id === selectedCharacterId);

  return (
    <>
      {characters.length > 0 && selectedCharacterId !== null ? (
        <Tabs
          value={String(selectedCharacterId)}
          onValueChange={(value) => setSelectedCharacterId(Number(value))}
          className="mb-6"
        >
          <TabsList variant="line">
            {characters.map((character) => (
              <TabsTrigger key={character.id} value={String(character.id)}>
                {character.name.trim() || `Character ${character.id}`}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}

      <DataStatus loading={loading} error={error} />

      {!loading && characters.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Add characters in Resources to get started.
        </p>
      ) : null}

      {selectedCharacter ? <CharacterPlanPanel character={selectedCharacter} /> : null}

      <ScreenSequencesTable />
    </>
  );
}
