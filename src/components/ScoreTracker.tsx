import './ScoreTracker.css';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { toast } from 'react-toastify';

import { RoundHistory } from '../types/RoundHistory';
import { ScoreTrackerProps } from '../types/ScoreTrackerProps';

function ScoreTracker({ players, onScoreUpdate }: ScoreTrackerProps) {
  const [roundScores, setRoundScores] = useState<{ [key: number]: string }>({});
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [editingRound, setEditingRound] = useState<number | null>(null);
  const [editScores, setEditScores] = useState<{ [key: number]: string }>({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const hasShownLoadToast = useRef(false);
  const historyListRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    if (historyListRef.current) {
      const { scrollTop } = historyListRef.current;
      setShowBackToTop(scrollTop > 300); // Show button after scrolling 300px
    }
  };

  function scrollToTop() {
    if (historyListRef.current) {
      historyListRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Load saved game data from localStorage on component mount
  useEffect(() => {
    const savedGame = localStorage.getItem('billardGame');
    if (savedGame && !hasShownLoadToast.current) {
      try {
        const gameData = JSON.parse(savedGame);
        setHistory(gameData.rounds || []);
        setCurrentRound((gameData.rounds?.length || 0) + 1);
        if (gameData.players) {
          onScoreUpdate(gameData.players);
        }
        hasShownLoadToast.current = true;
        toast.success('Previous game loaded successfully');
      } catch (error) {
        toast.error('Error loading saved game');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScoreChange(playerId: number, value: string) {
    setRoundScores(prev => ({
      ...prev,
      [playerId]: value
    }));
  };

  function handleEditScoreChange(playerId: number, value: string) {
    setEditScores(prev => ({
      ...prev,
      [playerId]: value
    }));
  };

  function clearSavedGame() {
    try {
      localStorage.removeItem('billardGame');
      setHistory([]);
      setCurrentRound(1);
      onScoreUpdate(players.map(player => ({ ...player, totalScore: 0 })));
      toast.success('Game cleared successfully!');
    } catch (error) {
      toast.error('Error clearing game');
    }
  };

  function submitScores() {
    // Check if any scores are entered
    const hasScores = Object.values(roundScores).some(score => score !== '');
    if (!hasScores) {
      toast.error('Please enter at least one score before submitting');
      return;
    }

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

    // Update history with the new round
    setHistory(prev => [...prev, roundData]);
    
    // Update current round number
    setCurrentRound(prev => prev + 1);
    
    // Update parent component with new player scores
    onScoreUpdate(updatedPlayers);
    
    // Reset round scores
    setRoundScores({});
    
    // Auto save to localStorage
    try {
      const gameData = {
        players: updatedPlayers,
        rounds: [...history, roundData],
        lastUpdate: new Date().toISOString()
      };
      localStorage.setItem('billardGame', JSON.stringify(gameData));
    } catch (error) {
      toast.error('Error auto-saving game');
    }
    
    // Show success message with round summary
    const roundSummary = roundData.scores
      .map(score => `${score.playerName}: ${score.roundScore >= 0 ? '+' : ''}${score.roundScore}`)
      .join(', ');
    toast.success(`Round ${currentRound} completed: ${roundSummary}`);
  };

  function handleUndoLastRound() {   
    if (history.length === 0) {
      toast.error('No rounds to undo');
      return;
    }

    // Get the last round
    const lastRound = history[history.length - 1];
    
    // Revert player scores
    const revertedPlayers = players.map(player => {
      const lastRoundScore = lastRound.scores.find(s => s.playerId === player.id);
      return {
        ...player,
        totalScore: player.totalScore - (lastRoundScore?.roundScore || 0)
      };
    });

    // Update history and current round
    setHistory(prev => prev.slice(0, -1));
    setCurrentRound(prev => prev - 1);
    
    // Update parent component with reverted scores
    onScoreUpdate(revertedPlayers);
    
    // Show success message
    toast.success('Last round undone successfully');
  };

  function startEditingRound(roundNumber: number) {
    setEditingRound(roundNumber);
    const round = history.find(r => r.roundNumber === roundNumber);
    if (round) {
      const initialEditScores = round.scores.reduce((acc, score) => ({
        ...acc,
        [score.playerId]: score.roundScore.toString()
      }), {});
      setEditScores(initialEditScores);
    }
  };

  function saveRoundEdit(roundNumber: number) {
    const round = history.find(r => r.roundNumber === roundNumber);
    if (!round) return;

    // Calculate the difference in scores
    const updatedPlayers = players.map(player => {
      const oldScore = round.scores.find(s => s.playerId === player.id)?.roundScore || 0;
      const newScore = parseInt(editScores[player.id] || '0') || 0;
      const scoreDiff = newScore - oldScore;
      
      return {
        ...player,
        totalScore: player.totalScore + scoreDiff
      };
    });

    // Update the round in history
    const updatedRound: RoundHistory = {
      ...round,
      scores: round.scores.map(score => ({
        ...score,
        roundScore: parseInt(editScores[score.playerId] || '0') || 0,
        totalScore: updatedPlayers.find(p => p.id === score.playerId)?.totalScore || 0
      }))
    };

    const updatedHistory = history.map(r => r.roundNumber === roundNumber ? updatedRound : r);
    setHistory(updatedHistory);
    onScoreUpdate(updatedPlayers);
    setEditingRound(null);
    setEditScores({});

    // Auto save to localStorage
    try {
      const gameData = {
        players: updatedPlayers,
        rounds: updatedHistory,
        lastUpdate: new Date().toISOString()
      };
      localStorage.setItem('billardGame', JSON.stringify(gameData));
    } catch (error) {
      toast.error('Error auto-saving game');
    }

    toast.success(`Round ${roundNumber} updated successfully`);
  };

  function cancelEdit() {
    setEditingRound(null);
    setEditScores({});
  };

  return (
    <div className="score-tracker">
      <div className="round-info">
        <h2>Round {currentRound}</h2>
        <div className="round-controls">
          {history.length > 0 && (
            <>
              <button 
                className="undo-button"
                onClick={handleUndoLastRound}
              >
                Undo Last Round
              </button>
              <button 
                className="clear-game-button"
                onClick={clearSavedGame}
              >
                Clear Game
              </button>
            </>
          )}
        </div>
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
          <div 
            className="history-list"
            ref={historyListRef}
            onScroll={handleScroll}
          >
            {[...history].reverse().map((round) => (
              <div key={round.roundNumber} className="history-item">
                <div className="history-header">
                  <h4>Round {round.roundNumber}</h4>
                  {editingRound === round.roundNumber ? (
                    <div className="edit-controls">
                      <button 
                        className="save-edit-button"
                        onClick={() => saveRoundEdit(round.roundNumber)}
                      >
                        Save
                      </button>
                      <button 
                        className="cancel-edit-button"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="edit-button"
                      onClick={() => startEditingRound(round.roundNumber)}
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="round-scores">
                  {round.scores.map((score) => (
                    <div key={score.playerId} className="player-round-score">
                      <span className="player-name">{score.playerName}</span>
                      {editingRound === round.roundNumber ? (
                        <input
                          type="number"
                          value={editScores[score.playerId] || ''}
                          onChange={(e) => handleEditScoreChange(score.playerId, e.target.value)}
                          className="edit-score-input"
                        />
                      ) : (
                        <span className="score-change">
                          {score.roundScore >= 0 ? '+' : ''}{score.roundScore}
                        </span>
                      )}
                      <span className="round-total">= {score.totalScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {showBackToTop && (
              <button 
                className="back-to-top-button"
                onClick={scrollToTop}
              >
                ↑ Back to Top
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreTracker; 