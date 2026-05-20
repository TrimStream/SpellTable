import { useEffect } from 'react';
import { fetchCard } from "./api/scryfall.ts";

function App() {
  useEffect(() => {
    fetchCard('0e259db1-14db-4314-998c-6a076a28d8cb')
        .then(card => console.log(card))
        .catch(err => console.error(err));
  }, []);

  return <div>Testing Scryfall API...</div>;
}

export default App
