export default function SimulationResults({ results, className }) {
    return (
      <div className={`w-full ${className}`}>
        <h3 className="text-xl font-medium mb-3">Simulation Results</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="py-3 px-4 text-left font-semibold rounded-tl-lg">Team</th>
                {Array.from({ length: results[0].frequencies.length }, (_, i) => (
                  <th key={i} className="py-3 px-4 text-center font-semibold">
                    Pick {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((team, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-800">{team.name}</td>
                  {team.frequencies.map((freq, i) => (
                    <td key={i} className="py-3 px-4 text-center text-gray-600">
                      {(freq * 100).toFixed(1)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }