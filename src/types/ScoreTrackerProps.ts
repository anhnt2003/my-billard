import { Player } from './Player';

export interface ScoreTrackerProps {
  players: Player[];
  onScoreUpdate(updatedPlayers: Player[]): void;
}