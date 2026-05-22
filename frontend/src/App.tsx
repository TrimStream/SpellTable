import scenario from './data/scenarios/scenario-01.json';
import { Board } from './components/Board/Board';
import type { Scenario } from './types';

const activeScenario = scenario as unknown as Scenario;

function App() {
  return <Board scenario={activeScenario} />;
}

export default App
