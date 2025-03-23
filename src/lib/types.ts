export type GameState = {
  currentQuestionId: string | null;
  revealedAnswers: string[];
  awardedToPendingPointsAnswers: string[];
  pendingScore: number;
  teamAScore: number;
  teamBScore: number;
  strikeCount: number;
};
