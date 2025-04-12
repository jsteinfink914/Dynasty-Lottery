export default function SimulationResults({ results, className }) {
    const positions = Array.from({ length: Object.keys(results).length }, (_, i) => i + 1);
  
    return (
      <table className={`table-auto w-full border-collapse ${className}`}>
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Team</th>
            {positions.map((pos) => (
              <th key={pos} className="border p-2">
                {pos}{pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th'} Pick
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(results).map(([team, probs]) => (
            <tr key={team} className="hover:bg-gray-100">
              <td className="border p-2">{team}</td>
              {probs.map((prob, index) => (
                <td key={index} className="border p-2 text-center">
                  {prob.toFixed(2)}%
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }