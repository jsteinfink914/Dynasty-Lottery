export default function SimulationResults({ results, className }) {
    const positions = Array.from({ length: results[0].frequencies.length }, (_, i) => i + 1);
  
    return (
      <div className={`w-full ${className}`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Simulation Results</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-lg rounded-lg border border-gray-200">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="py-3 px-4 text-left font-semibold text-sm rounded-tl-lg">
                  Team
                </th>
                {positions.map((pos) => (
                  <th
                    key={pos}
                    className="py-3 px-4 text-center font-semibold text-sm"
                  >
                    {pos}
                    {pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th'} Pick
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((team, index) => (
                <tr
                  key={team.name}
                  className={`border-b border-gray-200 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-blue-50 transition-colors`}
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {team.name}
                  </td>
                  {team.frequencies.map((freq, i) => (
                    <td
                      key={i}
                      className="py-3 px-4 text-center text-gray-600 text-sm"
                    >
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