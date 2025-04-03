import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'

import _ from 'lodash';

//Team performance over time
const TeamPerformanceChart = ({teamWeeklyStats, TEAM_COLORS}) => {
    // Transform the data for the chart
    const allWeeks = _(Object.values(teamWeeklyStats))
      .flatMap()
      .map(week => ({ weekNum: week.weekNum, weekDate: week.weekDate }))
      .uniqBy('weekNum')
      .orderBy('weekNum')
      .value();

    const startWeek = { weekNum: 0, weekDate: "Start" };
  
    // Transform data for chart - one line per team
    const chartData = [startWeek, ...allWeeks].map(week => {
      const dataPoint = {
        weekLabel: week.weekNum === 0 ? "Start" : `Week ${week.weekNum} (${week.weekDate})`,
        weekNum: week.weekNum,
      };
      
      // Add each team's score for this week
      Object.keys(teamWeeklyStats).forEach(teamName => {
        if (week.weekNum === 0) {
          dataPoint[teamName] = 0; // Zero value for week 0
        } else {
          const teamWeek = teamWeeklyStats[teamName].find(w => w.weekNum === week.weekNum);
          dataPoint[teamName] = teamWeek ? teamWeek.teamWeeklyScore : 0;
        }
      });
      
      return dataPoint;
    });
  
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Team Performance Over Time</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="weekLabel" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(teamWeeklyStats).map((teamName, index) => (
                <Line 
                  key={teamName}
                  type="linear" 
                  dataKey={teamName} 
                  name={teamName}
                  stroke={TEAM_COLORS[teamName] || '#000000'} 
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
       </div>
    );
  };
export default TeamPerformanceChart;