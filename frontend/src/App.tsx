import scenario from './data/scenarios/scenario-01.json';
import { PlayerZone } from "./components/PlayerZone/PlayerZone";
import type { Player } from "./types";

function App() {
  return <PlayerZone player={scenario.players[0] as Player} />;
}

export default App
