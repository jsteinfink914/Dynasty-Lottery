export function selectTeam(teams) {
    const total = teams.reduce((sum, team) => sum + team.odds, 0);
    let rand = Math.random() * total;
    for (const team of teams) {
      if (rand < team.odds) return team;
      rand -= team.odds;
    }
    return teams[teams.length - 1]; // Fallback
  }
  
  export function runSimulation(teams, rounds) {
    const results = {};
    teams.forEach((team) => {
      results[team.name] = Array(teams.length).fill(0);
    });
  
    for (let i = 0; i < rounds; i++) {
      let remaining = [...teams];
      for (let pos = 0; pos < teams.length; pos++) {
        const selected = selectTeam(remaining);
        results[selected.name][pos]++;
        remaining = remaining.filter((t) => t !== selected);
      }
    }
  
    Object.keys(results).forEach((team) => {
      results[team] = results[team].map((count) => (count / rounds) * 100);
    });
  
    return results;
  }