import './ScoreTracker.css';

import React, { useState } from 'react';

interface Player {
  id: number;
  name: string;
  totalScore: number;
}

interface RoundHistory {
  roundNumber: number;
  scores: {
    playerId: number;
    playerName: string;
    roundScore: number;
    totalScore: number;
  }[];
}

interface ScoreTrackerProps {
  players: Player[];
  onScoreUpdate: (updatedPlayers: Player[]) => void;
}

const ScoreTracker: React.FC<ScoreTrackerProps> = ({ players, onScoreUpdate }) => {
  const [roundScores, setRoundScores] = useState<{ [key: number]: string }>({});
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [history, setHistory] = useState<RoundHistory[]>([]);

  const handleScoreChange = (playerId: number, value: string) => {
    setRoundScores(prev => ({
      ...prev,
      [playerId]: value
    }));
  };

  const saveGameToJson = (roundHistory: RoundHistory[]) => {
    const gameData = {
      players: players,
      rounds: roundHistory,
      lastUpdate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(gameData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `billard_game_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const submitScores = () => {
    const roundData: RoundHistory = {
      roundNumber: currentRound,
      scores: []
    };

    const updatedPlayers = players.map(player => {
      const roundScore = parseInt(roundScores[player.id] || '0') || 0;
      const newTotalScore = player.totalScore + roundScore;
      
      roundData.scores.push({
        playerId: player.id,
        playerName: player.name,
        roundScore: roundScore,
        totalScore: newTotalScore
      });

      return {
        ...player,
        totalScore: newTotalScore
      };
    });

    setHistory(prev => [...prev, roundData]);
    setCurrentRound(prev => prev + 1);
    onScoreUpdate(updatedPlayers);
    setRoundScores({}); // Reset round scores after submission
  };

  return (
    <div className="score-tracker">
      <div className="round-info">
        <h2>Round {currentRound}</h2>
        <button 
          className="save-game-button"
          onClick={() => saveGameToJson(history)}
        >
          Save Game Data
        </button>
      </div>

      <div className="score-inputs">
        {players.map(player => (
          <div key={player.id} className="score-input-group">
            <div className="player-info">
              <span className="player-name">{player.name}</span>
              <span className="total-score">Total: {player.totalScore}</span>
            </div>
            <div className="score-input">
              <input
                type="number"
                value={roundScores[player.id] || ''}
                onChange={(e) => handleScoreChange(player.id, e.target.value)}
                placeholder="Enter score"
              />
            </div>
          </div>
        ))}
      </div>

      <button 
        className="submit-scores"
        onClick={submitScores}
      >
        Submit Round {currentRound} Scores
      </button>

      {history.length > 0 && (
        <div className="round-history">
          <h3>Round History</h3>
          <div className="history-list">
            {history.map((round) => (
              <div key={round.roundNumber} className="history-item">
                <h4>Round {round.roundNumber}</h4>
                <div className="round-scores">
                  {round.scores.map((score) => (
                    <div key={score.playerId} className="player-round-score">
                      <span className="player-name">{score.playerName}</span>
                      <span className="score-change">
                        {score.roundScore >= 0 ? '+' : ''}{score.roundScore}
                      </span>
                      <span className="round-total">= {score.totalScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreTracker; 