import { useState } from 'react';
import Wheel from '../components/Wheel';
import SimulationResults from '../components/SimulationResults';
import { selectTeam, runSimulation } from '../utils/lottery';

export default function Home() {
  // State for team inputs and app functionality
  const [teams, setTeams] = useState([]);
  const [teamInputs, setTeamInputs] = useState(
    Array(6).fill({ name: '', odds: '' })
  );
  const [draftStarted, setDraftStarted] = useState(false);
  const [remainingTeams, setRemainingTeams] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [simulationRounds, setSimulationRounds] = useState(1000);
  const [simulationResults, setSimulationResults] = useState(null);

  // Handle changes to team name and odds inputs
  const handleInputChange = (index, field, value) => {
    const newInputs = [...teamInputs];
    newInputs[index][field] = value;
    setTeamInputs(newInputs);
  };

  // Validate and set teams from inputs
  const setTeamsFromInput = () => {
    const newTeams = teamInputs.map((input) => ({
      name: input.name.trim(),
      odds: parseFloat(input.odds),
    }));

    // Validation
    if (newTeams.length !== 6 || newTeams.some((team) => !team.name || isNaN(team.odds) || team.odds <= 0)) {
      alert('Please enter exactly 6 teams with valid names and positive odds.');
      return;
    }
    const names = newTeams.map((team) => team.name);
    if (new Set(names).size !== names.length) {
      alert('Team names must be unique.');
      return;
    }

    setTeams(newTeams);
    setDraftStarted(false);
    setSelectedOrder([]);
    setRemainingTeams([]);
    setSimulationResults(null);
  };

  // Start the draft lottery
  const startDraft = () => {
    if (teams.length !== 6) {
      alert('Please set 6 teams first.');
      return;
    }
    setRemainingTeams([...teams]);
    setSelectedOrder([]);
    setDraftStarted(true);
    setRotation(0);
  };

  // Spin the wheel to select a team
  const spin = () => {
    if (spinning || remainingTeams.length === 0) return;
    setSpinning(true);

    const team = selectTeam(remainingTeams);
    const totalOdds = remainingTeams.reduce((sum, t) => sum + t.odds, 0);
    let cumulative = 0;
    const segments = remainingTeams.map((t) => {
      const start = (cumulative / totalOdds) * 360;
      cumulative += t.odds;
      const end = (cumulative / totalOdds) * 360;
      return { team: t, start, end };
    });
    const segment = segments.find((s) => s.team === team);
    const targetAngle = (segment.start + segment.end) / 2;
    const spins = 5; // Number of full rotations
    const newRotation = -targetAngle - 360 * spins;

    setRotation(newRotation);
    setTimeout(() => {
      setSpinning(false);
      setSelectedOrder([...selectedOrder, team]);
      setRemainingTeams(remainingTeams.filter((t) => t !== team));
      setRotation(0);
    }, 3000); // Match animation duration
  };

  // Run the Monte Carlo simulation
  const runSim = () => {
    if (teams.length !== 6) {
      alert('Please set 6 teams first.');
      return;
    }
    if (simulationRounds <= 0 || simulationRounds > 1000000) {
      alert('Please enter a number of rounds between 1 and 1,000,000.');
      return;
    }
    const results = runSimulation(teams, simulationRounds);
    setSimulationResults(results);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Fantasy Football Draft Lottery
      </h1>

      {/* Team Input Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Enter Teams</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teamInputs.map((input, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={input.name}
                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                placeholder={`Team ${index + 1} Name`}
                className="border p-2 rounded w-full"
              />
              <input
                type="number"
                value={input.odds}
                onChange={(e) => handleInputChange(index, 'odds', e.target.value)}
                placeholder="Odds"
                min="0"
                step="0.1"
                className="border p-2 rounded w-24"
              />
            </div>
          ))}
        </div>
        <button
          onClick={setTeamsFromInput}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Set Teams
        </button>
      </section>

      {/* Draft Lottery Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Draft Lottery</h2>
        {draftStarted ? (
          <div className="flex flex-col items-center">
            {remainingTeams.length > 0 ? (
              <>
                <Wheel teams={remainingTeams} rotation={rotation} className="w-64 h-64" />
                <button
                  onClick={spin}
                  disabled={spinning}
                  className={`mt-4 px-4 py-2 rounded text-white ${
                    spinning ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {spinning ? 'Spinning...' : 'Spin for Pick ' + (selectedOrder.length + 1)}
                </button>
              </>
            ) : (
              <p className="text-lg">Draft Complete!</p>
            )}
            {selectedOrder.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-medium">Draft Order:</h3>
                <ol className="list-decimal list-inside">
                  {selectedOrder.map((team, index) => (
                    <li key={index} className="text-lg">{team.name}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={startDraft}
            disabled={teams.length !== 6}
            className={`px-4 py-2 rounded text-white ${
              teams.length !== 6 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Start Draft
          </button>
        )}
      </section>

      {/* Simulation Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Monte Carlo Simulation</h2>
        <div className="flex space-x-4 items-center">
          <input
            type="number"
            value={simulationRounds}
            onChange={(e) => setSimulationRounds(Number(e.target.value))}
            placeholder="Number of Rounds"
            min="1"
            max="1000000"
            className="border p-2 rounded w-32"
          />
          <button
            onClick={runSim}
            disabled={teams.length !== 6}
            className={`px-4 py-2 rounded text-white ${
              teams.length !== 6 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Run Simulation
          </button>
        </div>
        {simulationResults && (
          <SimulationResults results={simulationResults} className="mt-4" />
        )}
      </section>
    </div>
  );
}