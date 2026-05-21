import {useEffect, useState} from "react";
import { fetchCard } from "./api/scryfall.ts";
import { Zone as ZoneComponent } from "./components/CardZone/CardZone";
import type { Zone as ZoneType } from "./types";

function App() {
  const [zone, setZone] = useState<ZoneType | null>(null);

  useEffect(() => {
    const cardIds = [
      "0e259db1-14db-4314-998c-6a076a28d8cb", // Kenrith, the Returned King
      "4a1f905f-1d55-4d02-9d24-e58070793d3f", // Atraxa, Grand Unifier
      "63cda4a0-0dff-4edb-ae67-a2b7e2971350", // Kinnan, Bonder Prodigy
      "5a293c45-1e73-4527-be2f-2dcd5c47b610", // Sisay, Weatherlight Captain
      "2fea0356-6684-4730-9eb4-0262856bc1f9", // The Cabbage Merchant
    ];

    Promise.all(cardIds.map(id => fetchCard(id)))
      .then(cards => {
        const mockZone: ZoneType = {
          type: "battlefield",
          cards: cards,
          revealed: true,
        };
        setZone(mockZone);
      })
      .catch(err => console.log(err));
  }, []);

  if (!zone) return <div>Loading...</div>;

  return <ZoneComponent zone={zone} />;
}

export default App
