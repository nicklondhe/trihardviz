import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import _ from 'lodash';

// Score distribution with team breakdown
const ScoreDistributionChart = ({data, TEAM_COLORS}) => {
    const maxScore = _.maxBy(data, 'totalScore')?.totalScore || 0;
    const quartileSize = Math.ceil(maxScore / 4);
    const quartileRanges = [];
    
    for (let i = 0; i < 4; i++) {
      const lowerBound = i * quartileSize;
      const upperBound = (i + 1) * quartileSize;
      quartileRanges.push({
        range: `Quartile ${i + 1} (${i === 3 ? `${lowerBound}+` : `${lowerBound}-${upperBound}`})`,
        lowerBound,
        upperBound: i === 3 ? Infinity : upperBound
      });
    }

    const teams = _.uniq(data.map(d => d.team));
    const quartiles = quartileRanges.map(quartile => {
        const result = { range: quartile.range };
        const totalInQuartile = data.filter(
          d => d.totalScore >= quartile.lowerBound && d.totalScore < quartile.upperBound
        ).length;
    
        teams.forEach(team => {
          const teamCount = data.filter(
            d => d.team === team &&
            d.totalScore >= quartile.lowerBound &&
            d.totalScore < quartile.upperBound
          ).length;
    
          // Scale to percentage
          result[team] = totalInQuartile > 0 ? (teamCount / totalInQuartile) * 100 : 0;
        });
    
        return result;
      });

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Score Distribution by Team</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={quartiles}
            layout="vertical" // Flip axes
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -5 }} />
            <YAxis dataKey="range" type="category" width={200} />
            <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Percentage']} />
            <Legend />
            {teams.map((team, index) => (
              <Bar
                key={team}
                dataKey={team}
                name={team}
                stackId="a"
                fill={TEAM_COLORS[team] || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    );
  };

export default ScoreDistributionChart;