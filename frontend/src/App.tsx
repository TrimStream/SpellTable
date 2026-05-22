import scenario from './data/scenarios/scenario-01.json';
import { Board } from './components/Board/Board';
import type { Scenario } from './types';
import { useScenario } from "./hooks/useScenario";

const rawScenario = scenario as unknown as Scenario;

function App() {
  const { scenario: loadedScenario, loading, error } = useScenario(rawScenario);

  if (loading) {
    return <div>Loading scenario...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!loadedScenario) {
    return <div>No scenario available</div>;
  }

  return <Board scenario={loadedScenario} />;
}

export default App
