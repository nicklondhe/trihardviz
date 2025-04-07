import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import _ from 'lodash';
import { useState } from 'react';

// Component for Individual Performance by Team
  const IndividualPerformanceChart = ({data, TEAM_COLORS}) => {
    // Local state for selected team
    const [selectedTeam, setSelectedTeam] = useState('');
    
    // Get unique teams for the dropdown
    const teams = _.uniq(data.map(d => d.team)).sort();

    // Filter data for the selected team and sort by totalScore
    const filteredData = data
      .filter(d => d.team === selectedTeam)
      .map(d => ({
        name: d.name,
        score: d.totalScore,
        team: d.team
      }))
      .sort((a, b) => b.score - a.score); // Sort descending by score

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Individual Performance by Team</h2>
        
        {/* Dropdown for team selection */}
        <div className="mb-4">
          <label htmlFor="team-select" className="mr-2 font-medium">Select Team:</label>
          <select
            id="team-select"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Select a team</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        {/* Bar chart for individual performance */}
        <div style={{ width: '100%', height: `${Math.max(filteredData.length * 40, 400)}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Score (points)', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="name" type="category" width={110} />
              <Tooltip 
                formatter={(value) => [`${value} points`, 'Score']}
                labelFormatter={(name) => `${name} (${selectedTeam})`}
              />
              <Bar dataKey="score" name="Score" fill={TEAM_COLORS[selectedTeam] || '#8884d8'} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

export default IndividualPerformanceChart;