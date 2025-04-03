import React, { useEffect, useState } from 'react';

import AverageScoreChart from './AverageScore';
import IndividualPerformanceChart from './IndividualPerformance';
import Papa from 'papaparse';
import ScoreDistributionChart from './ScoreDistribution';
import TeamComparisonChart from './TeamComparison';
import TeamPerformanceChart from './TeamPerformance';
import TeamPerformanceTrend from './TeamPerformanceTrend';
import TopPerformersChart from './TopPerfomers';
import _ from 'lodash';

const TriHardVisualizations = () => {
  const [data, setData] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [userWeeklyStats, setUserWeeklyStats] = useState([]);
  const [teamWeeklyStats, setTeamWeeklyStats] = useState([]);
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
    const challengeColumns = headers.filter(header => 
      header.includes('Challenge')
    );
    
    // Process user data
    const userData = data.filter(row => row['Name'] && row['Team Name']).map(row => {
      const totalScore = weekColumns.reduce((sum, weekCol) => 
        sum + (parseFloat(row[weekCol]) || 0), 0);
      const totalChallengeScore = challengeColumns.reduce((sum, challengeCol) => 
        sum + (parseFloat(row[challengeCol]) || 0), 0);
      
      return {
        name: row['Name'],
        team: row['Team Name'],
        stravaId: row['Strava id'],
        totalScore,
        totalChallengeScore,
        combinedScore: totalScore + totalChallengeScore
      };
    });
    
    // Process team stats
    const teamStats = _(userData)
      .groupBy('team')
      .map((members, teamName) => {
        const totalScore = _.sumBy(members, 'totalScore');
        const totalChallengeScore = _.sumBy(members, 'totalChallengeScore');
        
        return {
          teamName,
          memberCount: members.length,
          totalScore,
          totalChallengeScore,
          combinedScore: totalScore + totalChallengeScore,
          avgScore: totalScore / members.length
        };
      })
      .orderBy(['combinedScore'], ['desc'])
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

    //weekly stats
    const userWeeklyStats = _(data)
      .filter(row => row['Name'] && row['Team Name'])
      .map(row => {
        // Create weekly breakdown for each user
        const weeklyScores = weekColumns.map((weekCol, index) => {
          const weekNum = index + 1;
          const weekDate = weekCol;
          const score = parseFloat(row[weekCol]) || 0;
          const challengeCol = challengeColumns.find(col => col.includes(weekCol));
          const challengeScore = challengeCol ? (parseFloat(row[challengeCol]) || 0) : 0;
          
          return {
            weekNum,
            weekDate,
            score,
            challengeScore,
            active: score > 0
          };
        });
        
        return {
          name: row['Name'],
          team: row['Team Name'],
          stravaId: row['Strava id'],
          weeklyScores
        };
      })
      .value();

      const teamWeeklyStats = _(userWeeklyStats)
        .groupBy('team')
        .mapValues((members, teamName) => {
          // Get all unique weeks
          const allWeeks = _(members)
            .flatMap(member => member.weeklyScores)
            .uniqBy('weekNum')
            .orderBy(['weekNum'], ['asc'])
            .value();
            
          // Calculate weekly team stats
          return allWeeks.map(week => {
            const teamWeeklyScore = _.sumBy(members, member => 
              member.weeklyScores[week.weekNum - 1].score
            );
            
            const teamWeeklyChallengeScore = _.sumBy(members, member => 
              member.weeklyScores[week.weekNum - 1].challengeScore
            );
            
            const activeMembers = _.sumBy(members, member => 
              member.weeklyScores[week.weekNum - 1].active ? 1 : 0
            );
            
            return {
              teamName,
              weekNum: week.weekNum,
              weekDate: week.weekDate,
              teamWeeklyScore,
              teamWeeklyChallengeScore,
              activeMembers,
              memberCount: members.length
            };
          });
        })
        .value();
      
    return { userData, teamStats, topPerformers, userWeeklyStats, teamWeeklyStats };
  };

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
            const { userData, teamStats, topPerformers, userWeeklyStats, teamWeeklyStats } = processData(results);
            
            setData(userData);
            setTeamStats(teamStats);
            setTopPerformers(topPerformers);
            setUserWeeklyStats(userWeeklyStats);
            setTeamWeeklyStats(teamWeeklyStats);
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

  // Two-level tab navigation with new sub-tab
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
        { id: 'distribution', label: 'Score Distribution' },
        { id: 'individualPerformance', label: 'Individual Performance' }
      ],
      trends: [
        { id: 'teamOverTime', label: 'Team performance over time' },
        { id: 'teamPerfTrends', label: 'Team performance trends'}
      ]
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
          <div className="grid grid-cols-5 w-full bg-white border-b border-gray-300">
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
              {activeSubTab === 'teamComparison' && <TeamComparisonChart teamStats={teamStats} TEAM_COLORS={TEAM_COLORS}/>}
              {activeSubTab === 'averageScores' && <AverageScoreChart teamStats={teamStats} TEAM_COLORS={TEAM_COLORS}/>}
              {activeSubTab === 'topPerformers' && <TopPerformersChart topPerformers={topPerformers} TEAM_COLORS={TEAM_COLORS}/>}
              {activeSubTab === 'distribution' && <ScoreDistributionChart data={data} TEAM_COLORS={TEAM_COLORS}/>}
              {activeSubTab === 'individualPerformance' && <IndividualPerformanceChart data={data} TEAM_COLORS={TEAM_COLORS}/>}
            </>
          )}
          
          {activeMainTab === 'trends' && (
            <div className="p-8 text-center text-gray-500">
              <>
                {activeSubTab === 'teamOverTime' && <TeamPerformanceChart teamWeeklyStats={teamWeeklyStats} TEAM_COLORS={TEAM_COLORS}/>}
                {activeSubTab === 'teamPerfTrends' && <TeamPerformanceTrend teamWeeklyStats={teamWeeklyStats}/>}
              </>
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