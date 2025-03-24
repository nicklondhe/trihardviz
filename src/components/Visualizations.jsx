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
  const [activeTab, setActiveTab] = useState('teamComparison');

  // Colors for teams
  const TEAM_COLORS = {
    "Slayin' Peaches": '#FFB81C',
    'Goat Guavas': '#9DC183',
    "Flexin' Figs": '#D8A1C4',
    'Power Plums': '#8E4585',
    'Sigma Mangoes': '#FF8C00',
    'Goat Grapes': '#6F2DA8'
  };

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

  // Create a score distribution chart
  const ScoreDistributionChart = () => {
    // Create score buckets
    const buckets = [
      { range: '0-50', count: 0 },
      { range: '51-100', count: 0 },
      { range: '101-150', count: 0 },
      { range: '151-200', count: 0 },
      { range: '201-250', count: 0 },
      { range: '251-300', count: 0 },
      { range: '301+', count: 0 }
    ];

    // Count scores in each bucket
    data.forEach(person => {
      if (person['Total Score'] <= 50) buckets[0].count++;
      else if (person['Total Score'] <= 100) buckets[1].count++;
      else if (person['Total Score'] <= 150) buckets[2].count++;
      else if (person['Total Score'] <= 200) buckets[3].count++;
      else if (person['Total Score'] <= 250) buckets[4].count++;
      else if (person['Total Score'] <= 300) buckets[5].count++;
      else buckets[6].count++;
    });

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Score Distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={buckets} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} participants`, 'Count']} />
              <Legend />
              <Bar dataKey="count" name="Number of Participants" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-4">Loading data...</div>;
  } else {
    return (
        <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">TriHard Club Leaderboard Visualizations</h1>
        
        <div className="flex mb-6 overflow-x-auto">
            <button 
            className={`px-4 py-2 mr-2 rounded-md ${activeTab === 'teamComparison' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('teamComparison')}
            >
            Team Scores
            </button>
            <button 
            className={`px-4 py-2 mr-2 rounded-md ${activeTab === 'averageScores' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('averageScores')}
            >
            Average Scores
            </button>
            <button 
            className={`px-4 py-2 mr-2 rounded-md ${activeTab === 'topPerformers' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('topPerformers')}
            >
            Top Performers
            </button>
            <button 
            className={`px-4 py-2 mr-2 rounded-md ${activeTab === 'distribution' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('distribution')}
            >
            Score Distribution
            </button>
        </div>
        
        <div className="border rounded-lg p-4 bg-white shadow">
            {activeTab === 'teamComparison' && <TeamComparisonChart />}
            {activeTab === 'averageScores' && <AverageScoreChart />}
            {activeTab === 'topPerformers' && <TopPerformersChart />}
            {activeTab === 'distribution' && <ScoreDistributionChart />}
        </div>

        <div className="mt-6 text-sm text-gray-600">
            <p>Data last updated: {new Date().toLocaleDateString()}</p>
        </div>
        </div>
    );
  }
};

export default TriHardVisualizations;

  