import './PlayerSetup.css';

import {
  JSX,
  useState,
} from 'react';

import { toast } from 'react-toastify';

import { Player } from '../types/Player';
import ScoreTracker from './ScoreTracker';

function PlayerSetup() : JSX.Element {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: '', totalScore: 0 },
    { id: 2, name: '', totalScore: 0 },
  ]);
  const [gameStarted, setGameStarted] = useState(false);

  function updatePlayerCount(newCount: number) {
    const count = Math.max(2, Math.min(8, newCount));
    setPlayerCount(count);
    
    setPlayers(prevPlayers => {
      if (count > prevPlayers.length) {
        // Add new players while preserving existing players' data
        return [
          ...prevPlayers,
          ...Array.from({ length: count - prevPlayers.length }, (_, index) => ({
            id: prevPlayers.length + index + 1,
            name: '',
            totalScore: 0
          }))
        ];
      } else {
        // Remove excess players
        return prevPlayers.slice(0, count);
      }
    });
    
    toast.info(`Player count updated to ${count}`);
  };

  function handlePlayerNameChange(id: number, name: string) {
    setPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player.id === id ? { ...player, name } : player
      )
    );
  };

  function handleStartGame() {
    const emptyNames = players.filter(player => !player.name.trim());
    if (emptyNames.length > 0) {
      toast.error('Please enter names for all players before starting the game.');
      return;
    }
    setGameStarted(true);
    if (players.some(p => p.totalScore === 0)) {
      toast.success('Game started successfully!');
    } 
  };

  function handleBackToSetup() {
    setGameStarted(false);
    toast.info('Returned to player setup');
  };

  function handleScoreUpdate(updatedPlayers: Player[]) {
    setPlayers(updatedPlayers);
  };

  return (
    <div className="player-setup">
      {!gameStarted ? (
        <>
          <div className="player-count-control">
            <label>Number of Players:</label>
            <div className="count-buttons">
              <button 
                onClick={() => updatePlayerCount(playerCount - 1)}
                disabled={playerCount <= 2}
                className="count-button"
              >
                -
              </button>
              <span className="player-count">{playerCount}</span>
              <button 
                onClick={() => updatePlayerCount(playerCount + 1)}
                disabled={playerCount >= 8}
                className="count-button"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="player-names">
            {players.map(player => (
              <div key={player.id} className="player-input">
                <label htmlFor={`player${player.id}`}>
                  Player {player.id} Name:
                  {player.totalScore !== 0 && 
                    <span className="current-score"> (Current Score: {player.totalScore})</span>
                  }
                </label>
                <input
                  type="text"
                  id={`player${player.id}`}
                  value={player.name}
                  onChange={(e) => handlePlayerNameChange(player.id, e.target.value)}
                  placeholder={`Enter Player ${player.id} name`}
                />
              </div>
            ))}
          </div>

          <button 
            className="start-game-button"
            onClick={handleStartGame}
          >
            {players.some(p => p.totalScore !== 0) ? 'Continue Game' : 'Start Game'}
          </button>
        </>
      ) : (
        <>
          <button 
            className="back-button"
            onClick={handleBackToSetup}
          >
            ← Back to Player Setup
          </button>
          <ScoreTracker 
            players={players}
            onScoreUpdate={handleScoreUpdate}
          />
        </>
      )}
    </div>
  );
};

export default PlayerSetup; 