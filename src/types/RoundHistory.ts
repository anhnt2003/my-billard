export interface RoundHistory {
  roundNumber: number;
  scores: {
    playerId: number;
    playerName: string;
    roundScore: number;
    totalScore: number;
  }[];
}
