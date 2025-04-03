import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const TeamComparisonChart = ({teamStats, TEAM_COLORS}) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Team Total Scores</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={teamStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="teamName" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} points`]} />
            <Legend />
            <Bar dataKey="totalScore" name="Activity Score" stackId="a">
              {teamStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={TEAM_COLORS[entry.teamName] || '#8884d8'} />
              ))}
            </Bar>
            <Bar dataKey="totalChallengeScore" name="Challenge Score" stackId="a" fill="#FFD700" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  export default TeamComparisonChart;