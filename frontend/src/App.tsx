import scenario from './data/scenarios/scenario-01.json';
import { ScenarioPanel } from './components/ScenarioPanel/ScenarioPanel';
import { PlayerZone } from "./components/PlayerZone/PlayerZone";
import type { Player, Scenario } from "./types";

const activeScenario = scenario as unknown as Scenario;

function App() {
  return (
    <>
      <ScenarioPanel scenario={activeScenario} />
      <PlayerZone player={activeScenario.players[0] as Player} />
    </>
  );
}

export default App
