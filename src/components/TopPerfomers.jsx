import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import _ from 'lodash';

// Component for Top Performers
const TopPerformersChart = ({ topPerformers, TEAM_COLORS }) => {
    const renderCustomizedLegend = () => {
      const teams = _.uniqBy(topPerformers, 'team').map(p => p.team);
      
      return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          {teams.map((team) => (
            <div key={team} style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
              <div style={{ 
                width: '15px', 
                height: '15px', 
                backgroundColor: TEAM_COLORS[team] || '#8884d8',
                marginRight: '5px'
              }} />
              <span>{team}</span>
            </div>
          ))}
        </div>
      );
    };
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Top 10 Performers</h2>
        <div style={{ width: '100%', height: '500px' }}>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={topPerformers}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value, name) => [`${value} points`, name]}
                labelFormatter={(name) => {
                  const performer = topPerformers.find(p => p.name === name);
                  return `${name} (${performer?.team || 'Unknown team'})`;
                }}
              />
              <Bar dataKey="score" name="Score">
                {topPerformers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={TEAM_COLORS[entry.team] || '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {renderCustomizedLegend()}
        </div>
      </div>
    );
  };
export default TopPerformersChart;