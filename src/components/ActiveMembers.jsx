import { Bar, BarChart, CartesianGrid, Cell, Label, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import React from 'react';

const ActiveMembersChart = ({ teamWeeklyStats, TEAM_COLORS }) => {
  // Convert dictionary data to array format we need
  const formatData = (statsData) => {
    const teamsData = [];
    const allWeeks = new Set();
    
    // Extract team names and gather all weeks
    Object.entries(statsData).forEach(([teamName, teamData]) => {
      teamData.forEach(week => {
        allWeeks.add(week.weekNum);
      });
    });
    
    // Sort weeks in ascending order
    const weeks = [...allWeeks].sort((a, b) => a - b);
    
    // Calculate weekly averages first
    const weeklyAverages = {};
    weeks.forEach(weekNum => {
      let totalActiveMembers = 0;
      let teamCount = 0;
      
      Object.values(statsData).forEach(teamData => {
        const weekData = teamData.find(w => w.weekNum === weekNum);
        if (weekData) {
          totalActiveMembers += weekData.activeMembers;
          teamCount++;
        }
      });
      
      weeklyAverages[weekNum] = totalActiveMembers / teamCount;
    });
    
    
    // Create team-based data with deviations
    Object.entries(statsData).forEach(([teamName, teamData]) => {
      const result = {
        teamName,
        color: TEAM_COLORS[teamName] || `#${Math.floor(Math.random()*16777215).toString(16)}`
      };
      
      // Add data for each week
      teamData.forEach(weekData => {
        const weekAverage = weeklyAverages[weekData.weekNum];
        const deviation = weekData.activeMembers - weekAverage;
        
        result[`week${weekData.weekNum}`] = deviation;
        result[`week${weekData.weekNum}Absolute`] = weekData.activeMembers;
        result[`week${weekData.weekNum}Average`] = weekAverage;
      });
      
      teamsData.push(result);
    });
    
    return { teamsData, weeks };
  };

  const { teamsData, weeks } = formatData(teamWeeklyStats);

  // Custom team deviation tooltip
  const TeamDeviationTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Find the latest week in the payload
        const weekKeys = payload.map(p => p.dataKey).filter(key => key.startsWith('week'));
        const latestWeekKey = weekKeys[weekKeys.length - 1]; // Get the last week key
        
        if (!latestWeekKey) return null;
        
        const weekNum = parseInt(latestWeekKey.replace('week', ''));
        const teamName = payload[0].payload.teamName;
        
        // Find the payload item for the latest week
        const latestPayloadItem = payload.find(p => p.dataKey === latestWeekKey);
        if (!latestPayloadItem) return null;
        
        const deviation = latestPayloadItem.value;
        const absoluteValue = payload[0].payload[`${latestWeekKey}Absolute`];
        const average = payload[0].payload[`${latestWeekKey}Average`];
        const percentDeviation = ((deviation / average) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow" style={{ backgroundColor: 'rgba(255, 255, 255, 1)', border: '1px solid'}}>
          <p className="font-bold" style={{ color: payload[0].payload.color }}>{teamName}</p>
          <p className="text-gray-700">Week {weekNum}</p>
          <p className="text-gray-700">Active Members: {absoluteValue}</p>
          <p className="text-gray-700">Average: {average.toFixed(1)}</p>
          <p className="text-gray-700">
            Deviation: 
            <span className={deviation >= 0 ? "text-green-500" : "text-red-500"}>
              {" "}{deviation >= 0 ? "+" : ""}{deviation.toFixed(1)} ({percentDeviation}%)
            </span>
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Team Active Members: Deviation from Average</h2>
      </div>
      
      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={teamsData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number">
              <Label value="Deviation from Weekly Average" offset={-10} position="insideBottom" />
            </XAxis>
            <YAxis 
              dataKey="teamName" 
              type="category"
              width={120}
              tick={({ y, payload }) => (
                <text x={0} y={y} textAnchor="start" fill={teamsData.find(t => t.teamName === payload.value)?.color || '#000'} fontWeight="bold">
                  {payload.value}
                </text>
              )}
            />
            <Tooltip content={<TeamDeviationTooltip />} />
            <ReferenceLine x={0} stroke="#000" />
            {weeks.map(week => (
              <Bar 
                key={`week${week}`} 
                dataKey={`week${week}`} 
                name={`Week ${week}`} 
              >
                {teamsData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry[`week${week}`] >= 0 ? '#4caf50' : '#f44336'} 
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActiveMembersChart;