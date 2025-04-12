const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'L', x, y,
    'Z'
  ].join(' ');
}

export default function Wheel({ teams, rotation, className, style }) {
  const totalOdds = teams.reduce((sum, team) => sum + team.odds, 0);
  let cumulative = 0;
  const segments = teams.map((team) => {
    const startAngle = (cumulative / totalOdds) * 360;
    cumulative += team.odds;
    const endAngle = (cumulative / totalOdds) * 360;
    return { team, startAngle, endAngle };
  });

  const wheelKey = `${teams.map((t) => t.name).join('-')}-${rotation}`;

  console.log(`Wheel rendering with rotation: ${rotation}deg`);

  return (
    <div className="relative" style={{ ...style, maxWidth: '300px', maxHeight: '300px' }}>
      <div className="absolute inset-0 z-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className={className}>
          <polygon points="50,10 47,5 53,5" fill="red" />
        </svg>
      </div>
      {/* Rotating wheel */}
      <div
        className="absolute inset-0 z-0"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 3s cubic-bezier(0.33, 0, 0.66, 1)',
          willChange: 'transform',
        }}
      >
        <svg
          key={wheelKey}
          viewBox="0 0 100 100"
          className={className}
          style={{ transform: 'rotate(0deg)' }}
        >
          {segments.map((segment, index) => {
            const path = describeArc(50, 50, 45, segment.startAngle, segment.endAngle);
            return (
              <path
                key={`path-${index}`}
                d={path}
                fill={colors[index % colors.length]}
                stroke="white"
                strokeWidth="0.5"
              />
            );
          })}
          {segments.map((segment, index) => {
            const angle = (segment.startAngle + segment.endAngle) / 2;
            const [x, y] = Object.values(polarToCartesian(50, 50, 30, angle));
            return (
              <text
                key={`text-${index}`}
                x={x}
                y={y}
                textAnchor="middle"
                fill="white"
                fontSize="4"
                dy=".35em"
              >
                {segment.team.name}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}