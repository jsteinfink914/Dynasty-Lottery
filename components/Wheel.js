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
    <svg
      key={wheelKey}
      viewBox="0 0 100 100"
      className={className}
      style={{
        ...style,
        maxWidth: '200px',
        maxHeight: '200px',
      }}
    >
      {/* Rotating group for segments and labels */}
      <g
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
          transition: 'transform 3s cubic-bezier(0.33, 0, 0.66, 1)',
          willChange: 'transform',
        }}
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
      </g>
      {/* Stationary red arrow at top */}
      <polygon points="50,5 45,15 55,15" fill="red" />
    </svg>
  );
}