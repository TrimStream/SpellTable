import {useEffect, useState} from "react";
import { fetchCard } from "./api/scryfall.ts";
import { Card } from "./components/Card/Card";
import type { Card as CardType } from "./types";

function App() {
  const [card, setCard] = useState<CardType | null>(null);

  useEffect(() => {
    fetchCard("0e259db1-14db-4314-998c-6a076a28d8cb")
        .then(card => setCard(card))
        .catch(err => console.log(err));
  }, []);

  if (!card) return <div>Loading...</div>;

  return <Card card={card} />;
}

export default App
