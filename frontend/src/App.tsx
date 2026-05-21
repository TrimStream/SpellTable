import {useEffect, useState} from "react";
import { fetchCard } from "./api/scryfall.ts";
import { PlayerZone } from "./components/PlayerZone/PlayerZone";
import type { Player } from "./types";

function App() {
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    // A few sample card IDs from Scryfall. First will be used as the commander.
    const cardIds = [
      "0e259db1-14db-4314-998c-6a076a28d8cb", // Kenrith, the Returned King (commander)
      "4a1f905f-1d55-4d02-9d24-e58070793d3f", // Atraxa, Grand Unifier
      "63cda4a0-0dff-4edb-ae67-a2b7e2971350", // Kinnan, Bonder Prodigy
      "5a293c45-1e73-4527-be2f-2dcd5c47b610", // Sisay, Weatherlight Captain
      "2fea0356-6684-4730-9eb4-0262856bc1f9", // The Cabbage Merchant
    ];

    Promise.all(cardIds.map(id => fetchCard(id)))
      .then(cards => {
        const [commander, ...battlefieldCards] = cards;

        const mockPlayer: Player = {
          id: "player_1",
          name: "You",
          life: 36,
          commanderTax: 1,
          zones: {
            command: {
              type: "command",
              cards: [commander],
              revealed: true,
            },
            battlefield: {
              type: "battlefield",
              cards: battlefieldCards,
              revealed: true,
            },
            hand: {
              type: "hand",
              cards: [],
              revealed: false,
            },
            graveyard: {
              type: "graveyard",
              cards: [],
              revealed: true,
            },
            exile: {
              type: "exile",
              cards: [],
              revealed: true,
            },
            library: {
              type: "library",
              cards: [],
              revealed: false,
            },
          }
        };

        setPlayer(mockPlayer);
      })
      .catch(err => console.error(err));
  }, []);

  if (!player) return <div>Loading...</div>;

  return <PlayerZone player={player} />;
}

export default App
