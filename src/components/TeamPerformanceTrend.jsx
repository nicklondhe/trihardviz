import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {useEffect, useState} from 'react';

const TeamPerformanceTrend = ({ teamWeeklyStats }) => {
    // Extract team names from data if not provided
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');

    useEffect(() => {
        if (teamWeeklyStats) {
            const teamNames = Object.keys(teamWeeklyStats);
            setTeams(teamNames);
      
            // Select first team by default if no team is selected
            if (teamNames.length > 0 && !selectedTeam) {
                setSelectedTeam(teamNames[0]);
            }
        }
    }, [teamWeeklyStats, selectedTeam]);
    
    // Filter data for selected team and process for chart
    const filteredData = (selectedTeam && teamWeeklyStats[selectedTeam]) 
    ? teamWeeklyStats[selectedTeam]
        .sort((a, b) => a.weekNum - b.weekNum)
        .map(item => ({
          ...item,
          week: `Week ${item.weekNum}`,
          participationPercent: Math.round((item.activeMembers / item.memberCount) * 100)
        }))
    : [];

    console.log('fiteredData:', filteredData);
  
    // Generate insights for selected team
    const generateInsights = (teamData) => {
      if (!teamData || teamData.length === 0) return null;
      
      // Get the latest and previous week data
      const currentWeekData = teamData[teamData.length - 1];
      const previousWeekData = teamData.length > 1 ? teamData[teamData.length - 2] : null;
      
      // Calculate trends
      const scoreTrend = previousWeekData 
        ? currentWeekData.teamWeeklyScore - previousWeekData.teamWeeklyScore 
        : 0;
        
      const currentParticipation = Math.round((currentWeekData.activeMembers / currentWeekData.memberCount) * 100);
      const previousParticipation = previousWeekData 
        ? Math.round((previousWeekData.activeMembers / previousWeekData.memberCount) * 100) 
        : 0;
      const participationTrend = previousWeekData ? currentParticipation - previousParticipation : 0;
      
      // Detect patterns
      const scores = teamData.map(week => week.teamWeeklyScore);
      const hasConsistentImprovement = scores.length >= 3 && 
        scores.slice(-3).every((score, i, arr) => i === 0 || score > arr[i-1]);
      
      const hasConsistentDecline = scores.length >= 3 && 
        scores.slice(-3).every((score, i, arr) => i === 0 || score < arr[i-1]);
      
      // Calculate correlations between participation and performance
      let participationScoreCorrelation = null;
      if (teamData.length >= 3) {
        const participations = teamData.map(week => 
          Math.round((week.activeMembers / week.memberCount) * 100)
        );
        
        // Check if participation and scores move in the same direction
        const recentScoreTrend = scores[scores.length - 1] - scores[scores.length - 3];
        const recentParticipationTrend = participations[participations.length - 1] - participations[participations.length - 3];
        
        if (recentScoreTrend > 0 && recentParticipationTrend > 0) {
          participationScoreCorrelation = 'positive';
        } else if (recentScoreTrend < 0 && recentParticipationTrend < 0) {
          participationScoreCorrelation = 'positive';
        } else if (recentScoreTrend > 0 && recentParticipationTrend < 0) {
          participationScoreCorrelation = 'negative';
        } else if (recentScoreTrend < 0 && recentParticipationTrend > 0) {
          participationScoreCorrelation = 'negative';
        }
      }
      
      return {
        currentScore: currentWeekData.teamWeeklyScore,
        scoreTrend,
        currentParticipation,
        participationTrend,
        hasConsistentImprovement,
        hasConsistentDecline,
        memberCount: currentWeekData.memberCount,
        activeMembers: currentWeekData.activeMembers,
        participationScoreCorrelation
      };
    };
    
    const insights = generateInsights(filteredData);
    console.log('insights:', insights);
  
    // Custom tooltip for dual-axis chart
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-2 border rounded shadow-sm">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-sm text-indigo-600">
              Score: <span className="font-medium">{payload[0].value}</span>
            </p>
            <p className="text-sm text-emerald-600">
              Participation: <span className="font-medium">{payload[1].value}%</span>
            </p>
          </div>
        );
      }
      return null;
    };
  
    return (
      <div className="mb-8">
        <div className="mb-4">
          <div className="team-selector">
            <label htmlFor="team-select" className="block text-sm font-medium mb-1">Select Team</label>
            <select 
              id="team-select"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="border rounded px-3 py-2 w-64"
            >
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Dual Axis Trend Chart */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">
            {selectedTeam} - Performance & Participation Trends
          </h2>
          
          <div className="h-64" style={{ width: '100%', height: '500px' }}>
            <ResponsiveContainer width="100%" height={450}>
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                
                {/* Left Y-axis for Score */}
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  stroke="#4f46e5" 
                  label={{ 
                    value: 'Weekly Score', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: '#4f46e5' }
                  }}
                />
                
                {/* Right Y-axis for Participation */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  domain={[0, 100]} 
                  label={{ 
                    value: 'Participation %', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { fill: '#10b981' }
                  }}
                />
                
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Score Line */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="teamWeeklyScore"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="Weekly Score"
                />
                
                {/* Participation Line */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="participationPercent"
                  stroke="#10b981"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="Participation %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Insights Widget */}
        {insights && (
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-3">Team Insights</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="score-insights">
                <h3 className="text-md font-medium mb-2">Score Performance</h3>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold">{insights.currentScore}</span>
                  <span className={`ml-2 ${insights.scoreTrend > 0 ? 'text-green-600' : insights.scoreTrend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {insights.scoreTrend > 0 ? `↑ +${insights.scoreTrend}` : insights.scoreTrend < 0 ? `↓ ${insights.scoreTrend}` : '→ 0'}
                  </span>
                </div>
                
                {/* Automated insights for score */}
                <ul className="mt-2 text-sm space-y-1">
                  {insights.hasConsistentImprovement && (
                    <li className="text-green-700">✓ Consistent improvement for 3+ weeks</li>
                  )}
                  {insights.hasConsistentDecline && (
                    <li className="text-red-700">⚠ Scores declining for 3+ consecutive weeks</li>
                  )}
                  {insights.scoreTrend > 5 && (
                    <li className="text-green-700">✓ Strong improvement this week (+{insights.scoreTrend})</li>
                  )}
                  {insights.scoreTrend < -5 && (
                    <li className="text-red-700">⚠ Significant drop this week ({insights.scoreTrend})</li>
                  )}
                </ul>
              </div>
              
              <div className="participation-insights">
                <h3 className="text-md font-medium mb-2">Team Participation</h3>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold">{insights.currentParticipation}%</span>
                  <span className="text-sm ml-2 text-gray-500">
                    ({insights.activeMembers}/{insights.memberCount} members)
                  </span>
                  <span className={`ml-2 ${insights.participationTrend > 0 ? 'text-green-600' : insights.participationTrend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {insights.participationTrend > 0 ? `↑ +${insights.participationTrend}%` : insights.participationTrend < 0 ? `↓ ${insights.participationTrend}%` : '→ 0%'}
                  </span>
                </div>
                
                {/* Automated insights for participation */}
                <ul className="mt-2 text-sm space-y-1">
                  {insights.currentParticipation === 100 && (
                    <li className="text-green-700">✓ Full team participation!</li>
                  )}
                  {insights.currentParticipation < 70 && (
                    <li className="text-red-700">⚠ Low team participation ({insights.currentParticipation}%)</li>
                  )}
                  {insights.participationTrend < -10 && (
                    <li className="text-red-700">⚠ Sharp decline in participation</li>
                  )}
                  {insights.participationTrend > 10 && (
                    <li className="text-green-700">✓ Strong improvement in participation</li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Coaching recommendations */}
            <div className="coaching-recommendations mt-4 pt-3 border-t">
              <h3 className="text-md font-medium mb-2">Coaching Recommendations</h3>
              <ul className="text-sm space-y-1">
                {insights.hasConsistentDecline && (
                  <li className="text-red-700">⚠ <strong>Urgent:</strong> Schedule team meeting to address consistent performance decline</li>
                )}
                {insights.scoreTrend < -5 && insights.participationTrend < 0 && (
                  <li className="text-red-700">⚠ Review team engagement strategies - both participation and scores are dropping</li>
                )}
                {insights.currentParticipation < 70 && (
                  <li>Reach out to inactive team members individually</li>
                )}
                {insights.hasConsistentImprovement && (
                  <li className="text-green-700">✓ Recognize team's consistent progress and highlight successful strategies</li>
                )}
                {insights.scoreTrend < 0 && insights.participationTrend > 0 && (
                  <li>Team is more engaged but scores are dropping - focus on effectiveness of activities</li>
                )}
                {insights.participationScoreCorrelation === 'positive' && (
                  <li className="text-green-700">✓ Participation directly impacts scores - continue focusing on engagement</li>
                )}
                {insights.participationScoreCorrelation === 'negative' && insights.currentParticipation < 80 && (
                  <li>Despite good scores with low participation, aim to engage more team members to ensure sustainability</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };
  
export default TeamPerformanceTrend;