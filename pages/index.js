import { useState } from 'react';
import Wheel from '../components/Wheel';
import SimulationResults from '../components/SimulationResults';
import { selectTeam, runSimulation } from '../utils/lottery';

export default function Home() {
  const [teams, setTeams] = useState([]);
  const [teamInputs, setTeamInputs] = useState(
    Array.from({ length: 6 }, () => ({ name: '', odds: '' }))
  );
  const [draftStarted, setDraftStarted] = useState(false);
  const [remainingTeams, setRemainingTeams] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinId, setSpinId] = useState(0);
  const [simulationRounds, setSimulationRounds] = useState(1000);
  const [simulationResults, setSimulationResults] = useState(null);

  const handleInputChange = (index, field, value) => {
    setTeamInputs((prevInputs) =>
      prevInputs.map((input, i) =>
        i === index ? { ...input, [field]: value } : input
      )
    );
  };

  const setTeamsFromInput = () => {
    const newTeams = teamInputs.map((input) => ({
      name: input.name.trim(),
      odds: parseFloat(input.odds),
    }));

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
    setSpinId(0);
  };

  const startDraft = () => {
    if (teams.length !== 6) {
      alert('Please set 6 teams first.');
      return;
    }
    setRemainingTeams([...teams]);
    setSelectedOrder([]);
    setDraftStarted(true);
    setRotation(0);
    setSpinId(0);
  };

  const spin = () => {
    if (spinning || remainingTeams.length === 0) return;
    setSpinning(true);
    setSpinId((prev) => prev + 1);

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
    // Adjust for stationary arrow at top (0°)
    const targetAngle = ((segment.start + segment.end) / 2 + 360) % 360;
    const spins = 5;
    const newRotation = -targetAngle + 360 * spins; // Positive for <g> rotation

    console.log(`Starting spin #${spinId + 1} to ${newRotation}deg for team ${team.name}`);
    setRotation(newRotation);

    setTimeout(() => {
      console.log(`Spin #${spinId + 1} complete, resetting to 0deg`);
      setSpinning(false);
      setSelectedOrder([...selectedOrder, team]);
      setRemainingTeams(remainingTeams.filter((t) => t !== team));
      setRotation(0);
    }, 3100);
  };

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

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Enter Teams</h2>
        <div className="bg-white shadow-md rounded-lg p-4">
          {teamInputs.map((input, index) => (
            <div key={index} className="flex items-center space-x-2 mb-3 last:mb-0">
              <input
                type="text"
                value={input.name}
                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                placeholder={`Team ${index + 1} Name`}
                className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                value={input.odds}
                onChange={(e) => handleInputChange(index, 'odds', e.target.value)}
                placeholder="Odds"
                min="0"
                step="0.1"
                className="border border-gray-300 p-2 rounded-lg w-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Draft Lottery</h2>
        {draftStarted ? (
          <div className="flex flex-col items-center">
            {remainingTeams.length > 0 ? (
              <>
                <Wheel
                  teams={remainingTeams}
                  rotation={rotation}
                  className="w-12 h-12 sm:w-12 sm:h-12"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
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
              <div className="mt-4 w-full">
                <h3 className="text-xl font-medium">Draft Order:</h3>
                <ol className="list-decimal list-inside bg-white shadow-md rounded-lg p-4">
                  {selectedOrder.map((team, index) => (
                    <li key={index} className="text-lg text-gray-800 py-1">{team.name}</li>
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

      <section>
        <h2 className="text-2xl font-semibold mb-4">Monte Carlo Simulation</h2>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start sm:items-center">
          <input
            type="number"
            value={simulationRounds}
            onChange={(e) => setSimulationRounds(Number(e.target.value))}
            placeholder="Number of Rounds"
            min="1"
            max="1000000"
            className="border border-gray-300 p-2 rounded-lg w-full sm:w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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