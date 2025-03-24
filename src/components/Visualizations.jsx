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
import React, { useEffect, useState } from 'react';

import Papa from 'papaparse';
import _ from 'lodash';

const TriHardVisualizations = () => {
  const [data, setData] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState('currentWeek');
  const [activeSubTab, setActiveSubTab] = useState('teamComparison');

  // Colors for teams
  const TEAM_COLORS = {
    "Slayin' Peaches": '#FFB81C',
    'Goat Guavas': '#9DC183',
    "Flexin' Figs": '#D8A1C4',
    'Power Plums': '#8E4585',
    'Sigma Mangoes': '#FF8C00',
    'Goat Grapes': '#6F2DA8'
  };

  // Process CSV data with updated headers
const processData = (results) => {
    const data = results.data;
    
    // Find all week columns (dates)
    const headers = results.meta.fields;
    const weekColumns = headers.filter(header => 
      /^\d+\/\d+$/.test(header) && !header.includes('Challenge')
    );
    
    // Process user data
    const userData = data.filter(row => row['Name'] && row['Team Name']).map(row => {
      // Calculate total score across all weeks
      const totalScore = weekColumns.reduce((sum, weekCol) => 
        sum + (parseFloat(row[weekCol]) || 0), 0);
      
      return {
        name: row['Name'],
        team: row['Team Name'],
        stravaId: row['Strava Id'],
        totalScore
      };
    });
    
    // Process team stats
    const teamStats = _(userData)
      .groupBy('team')
      .map((members, teamName) => {
        const totalScore = _.sumBy(members, 'totalScore');
        
        return {
          teamName,
          memberCount: members.length,
          totalScore,
          avgScore: totalScore / members.length,
          topScore: _.maxBy(members, 'totalScore')?.totalScore || 0
        };
      })
      .orderBy(['totalScore'], ['desc'])
      .value();
      
    // Get top performers
    const topPerformers = _(userData)
      .orderBy(['totalScore'], ['desc'])
      .take(10)
      .map(performer => ({
        name: performer.name,
        score: performer.totalScore,
        team: performer.team,
        minutes: performer.totalScore || 0
      }))
      .value();
      
    return { userData, teamStats, topPerformers };
  };

  /*
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Using standard fetch API instead of window.fs.readFile
        const response = await fetch('/leaderboard.csv');
        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Clean the data
            const cleanData = results.data.filter(row => 
              row['Name'] && row['Total Score'] !== null && !isNaN(row['Total Score'])
            );
            
            setData(cleanData);
            
            // Calculate team statistics
            const teamData = _(cleanData)
              .filter(row => row['Team Name'])
              .groupBy('Team Name')
              .map((members, teamName) => {
                const totalScore = _.sumBy(members, 'Total Score');
                return {
                  teamName,
                  memberCount: members.length,
                  totalScore,
                  avgScore: totalScore / members.length,
                  topScore: _.maxBy(members, 'Total Score')['Total Score']
                };
              })
              .orderBy(['totalScore'], ['desc'])
              .value();
            setTeamStats(teamData);
            
            // Get top performers across all teams
            const allTopPerformers = _(cleanData)
              .filter(row => row['Total Score'] > 0)
              .orderBy(['Total Score'], ['desc'])
              .take(10)
              .map(performer => ({
                name: performer.Name,
                score: performer['Total Score'],
                team: performer['Team Name'],
                minutes: performer['Total Score'] || 0
              }))
              .value();
            
            setTopPerformers(allTopPerformers);
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error reading file:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
*/
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/leaderboard.csv');
      const text = await response.text();
      
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Process data
          const { userData, teamStats, topPerformers } = processData(results);
          
          setData(userData);
          setTeamStats(teamStats);
          setTopPerformers(topPerformers);
          setLoading(false);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error reading file:', error);
      setLoading(false);
    }
  };

  fetchData();
}, []);

  // Component for Team Comparison chart
  const TeamComparisonChart = () => (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Team Total Scores</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={teamStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="teamName" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} points`, 'Total Score']} />
            <Legend />
            <Bar dataKey="totalScore" name="Team Total Score">
              {teamStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={TEAM_COLORS[entry.teamName] || '#8884d8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Component for Average Score Per Team
  const AverageScoreChart = () => {
    // Create a sorted copy for average scores
    const sortedByAvg = _.orderBy(teamStats, ['avgScore'], ['desc']);
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Average Score Per Team</h2>
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedByAvg} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="teamName" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value.toFixed(1)} points`, 'Average Score']} />
              <Legend />
              <Bar dataKey="avgScore" name="Average Score Per Member">
                {sortedByAvg.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={TEAM_COLORS[entry.teamName] || '#82ca9d'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Component for Top Performers
  const TopPerformersChart = () => {
    // Create custom bars for the legend to show team colors
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
              {/* Use custom shape for the bars to color by team */}
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

  // Score distribution with team breakdown
  const ScoreDistributionChart = () => {
    // Find max score to determine bucket ranges
    const maxScore = _.maxBy(data, 'totalScore')?.totalScore || 0;
    
    // Create dynamic buckets
    const bucketSize = Math.ceil(maxScore / 6);
    const bucketRanges = [];
    
    for (let i = 0; i < 6; i++) {
      const lowerBound = i * bucketSize;
      const upperBound = (i + 1) * bucketSize;
      bucketRanges.push({
        range: i === 5 ? `${lowerBound}+` : `${lowerBound}-${upperBound}`,
        lowerBound,
        upperBound: i === 5 ? Infinity : upperBound
      });
    }

    // Group data by team and bucket
    const teams = _.uniq(data.map(d => d.team));
    
    // Create stacked data structure
    const buckets = bucketRanges.map(bucket => {
      const result = { range: bucket.range };
      
      // Count for each team in this bucket
      teams.forEach(team => {
        result[team] = data.filter(
          d => d.team === team && 
          d.totalScore >= bucket.lowerBound && 
          d.totalScore < bucket.upperBound
        ).length;
      });
      
      return result;
    });

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Score Distribution by Team</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={buckets} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              {teams.map((team, index) => (
                <Bar 
                  key={team} 
                  dataKey={team} 
                  name={team} 
                  stackId="a"
                  fill={TEAM_COLORS[team] || `#${Math.floor(Math.random()*16777215).toString(16)}`} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  

  // Two-level tab navigation with just current week tabs implemented
  const TwoLevelTabNavigation = ({ activeMainTab, setActiveMainTab, activeSubTab, setActiveSubTab }) => {
    const mainTabs = [
      { id: 'currentWeek', label: 'Leaderboards' },
      { id: 'trends', label: 'Trends & Comparisons' }
    ];
    
    const subTabs = {
      currentWeek: [
        { id: 'teamComparison', label: 'Team Scores' },
        { id: 'averageScores', label: 'Average Scores' },
        { id: 'topPerformers', label: 'Top Performers' },
        { id: 'distribution', label: 'Score Distribution' }
      ],
      trends: [] // Empty for now, will populate later
    };

    return (
      <div className="mb-6 w-full">
      {/* Main tabs - full width */}
      <div className="grid grid-cols-2 w-full bg-gray-100 p-2 rounded-t-lg">
        {mainTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveMainTab(tab.id);
              if (subTabs[tab.id].length > 0) {
                setActiveSubTab(subTabs[tab.id][0].id);
              }
            }}
            className={activeMainTab === tab.id ? 'active-tab' : 'inactive-tab'}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Sub tabs - full width with clear highlighting */}
      {subTabs[activeMainTab].length > 0 && (
        <div className="grid grid-cols-4 w-full bg-white border-b border-gray-300">
          {subTabs[activeMainTab].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={activeSubTab === tab.id ? 'active-tab' : 'inactive-tab'}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
    );
  };

  if (loading) {
    return <div className="p-4">Loading data...</div>;
  } else {
    return (
        <div className="p-4">
        
       <TwoLevelTabNavigation 
          activeMainTab={activeMainTab}
          setActiveMainTab={setActiveMainTab}
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
        />

        <div className="border rounded-lg p-4 bg-white shadow">
          {activeMainTab === 'currentWeek' && (
            <>
              {activeSubTab === 'teamComparison' && <TeamComparisonChart />}
              {activeSubTab === 'averageScores' && <AverageScoreChart />}
              {activeSubTab === 'topPerformers' && <TopPerformersChart />}
              {activeSubTab === 'distribution' && <ScoreDistributionChart />}
            </>
          )}
          
          {activeMainTab === 'trends' && (
            <div className="p-8 text-center text-gray-500">
              Trend visualizations coming soon!
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
            <p>Data last updated: {new Date().toLocaleDateString()}</p>
        </div>
        </div>
    );
  }
};

export default TriHardVisualizations;

  