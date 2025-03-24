import { db, EVENTS, room, SINGLETON_ID } from "../lib/db";
import { getCurrentQuestion, QUESTIONS } from "../lib/questions";
import type { GameState } from "../lib/types";

export default function Controller() {
  const { data } = db.useQuery({
    gameState: {
      $: {
        where: {
          id: SINGLETON_ID,
        },
      },
    },
  });

  if (!data) return null;

  const gameState = data.gameState[0] as unknown as GameState;
  gameState.revealedAnswers = gameState.revealedAnswers ?? [];
  gameState.awardedToPendingPointsAnswers =
    gameState.awardedToPendingPointsAnswers ?? [];
  gameState.pendingScore = gameState.pendingScore ?? 0;
  gameState.teamAScore = gameState.teamAScore ?? 0;
  gameState.teamBScore = gameState.teamBScore ?? 0;
  gameState.strikeCount = gameState.strikeCount ?? 0;

  return (
    <div className="p-4 space-y-4">
      <ThemeSongButton />
      <QuestionSelector gameState={gameState} />
      <div>
        <p>Pending: {gameState.pendingScore ?? 0}</p>
        <p>Team A: {gameState.teamAScore ?? 0}</p>
        <p>Team B: {gameState.teamBScore ?? 0}</p>
        <p>Strikes: {gameState.strikeCount ?? 0}</p>
      </div>
      <Answers gameState={gameState} />
      <StrikeCounter gameState={gameState} />
    </div>
  );
}

const QuestionSelector = ({ gameState }: { gameState: GameState }) => {
  const UNDEFINED_SENTINEL = "__undefined__";

  return (
    <div>
      <select
        className="w-full text-black"
        value={gameState.currentQuestionId ?? UNDEFINED_SENTINEL}
        onChange={(e) => {
          const value = e.target.value;

          db.transact(
            db.tx.gameState[SINGLETON_ID].update({
              currentQuestionId: value === UNDEFINED_SENTINEL ? null : value,
              pendingScore: 0,
              revealedAnswers: [],
              awardedToPendingPointsAnswers: [],
            })
          );
        }}
      >
        <option value={UNDEFINED_SENTINEL}>None</option>
        {QUESTIONS.map((question, index) => (
          <option value={question.id} key={question.id}>
            ({index + 1}) {question.question}
          </option>
        ))}
      </select>
    </div>
  );
};

const Answers = ({ gameState }: { gameState: GameState }) => {
  const currentQuestion = getCurrentQuestion(gameState.currentQuestionId);

  if (currentQuestion === null) return null;

  const cutoff = Math.ceil(currentQuestion.answers.length / 2);
  const leftQuestions = currentQuestion.answers.slice(0, cutoff);
  const rightQuestions = currentQuestion.answers.slice(cutoff);

  return (
    <div className="grid grid-cols-2 gap-x-4">
      <div className="space-y-4">
        {leftQuestions.map((answer) => (
          <Answer key={answer.answer} answer={answer} gameState={gameState} />
        ))}
      </div>
      <div className="space-y-4">
        {rightQuestions.map((answer) => (
          <Answer key={answer.answer} answer={answer} gameState={gameState} />
        ))}
      </div>
    </div>
  );
};

const Answer = ({
  answer,
  gameState,
}: {
  answer: { answer: string; points: number };
  gameState: GameState;
}) => {
  const playCorrectAnswerSound = db.rooms.usePublishTopic(
    room,
    EVENTS.PLAY_CORRECT_ANSWER_SOUND
  );

  const revealed = gameState.revealedAnswers?.includes(answer.answer);
  const awardedToPendingPoints =
    gameState.awardedToPendingPointsAnswers?.includes(answer.answer);

  return (
    <Button
      onClick={() => {
        if (!revealed) {
          if (confirm(`Reveal "${answer.answer}?"`)) {
            db.transact(
              db.tx.gameState[SINGLETON_ID].update({
                revealedAnswers: [...gameState.revealedAnswers, answer.answer],
              })
            );
          }

          playCorrectAnswerSound(undefined);
        } else if (!awardedToPendingPoints) {
          if (
            confirm(`Add ${answer.points} pending points for ${answer.answer}?`)
          ) {
            db.transact(
              db.tx.gameState[SINGLETON_ID].update({
                awardedToPendingPointsAnswers: [
                  ...gameState.awardedToPendingPointsAnswers,
                  answer.answer,
                ],
                pendingScore: gameState.pendingScore + answer.points,
              })
            );
          }
        }
      }}
      style={{
        opacity: awardedToPendingPoints ? 0.1 : revealed ? 0.5 : 1,
      }}
    >
      {awardedToPendingPoints ? (
        <span>awarded</span>
      ) : revealed ? (
        <span>give {answer.points} points?</span>
      ) : (
        <span>
          {answer.answer} ({answer.points})
        </span>
      )}
    </Button>
  );
};

const StrikeCounter = ({ gameState }: { gameState: GameState }) => {
  const playIncorrectAnswerSound = db.rooms.usePublishTopic(
    room,
    EVENTS.PLAY_INCORRECT_ANSWER_SOUND
  );
  const showStrikes = db.rooms.usePublishTopic(room, EVENTS.SHOW_STRIKES);
  const showMaxStrikes = db.rooms.usePublishTopic(
    room,
    EVENTS.SHOW_MAX_STRIKES
  );

  return (
    <div className="grid grid-cols-3 gap-4">
      <Button
        onClick={() => {
          db.transact(
            db.tx.gameState[SINGLETON_ID].update({
              strikeCount: gameState.strikeCount + 1,
            })
          );
          playIncorrectAnswerSound(undefined);
          showStrikes(undefined);
        }}
      >
        Strike++
      </Button>
      <Button
        onClick={() => {
          playIncorrectAnswerSound(undefined);
          showMaxStrikes(undefined);
        }}
      >
        Max!! (3)
      </Button>
      <Button
        onClick={() => {
          if (gameState.strikeCount === 0) return;

          db.transact(
            db.tx.gameState[SINGLETON_ID].update({
              strikeCount: gameState.strikeCount - 1,
            })
          );
        }}
      >
        Strike--
      </Button>
    </div>
  );
};

const ThemeSongButton = () => {
  const toggleThemeSong = db.rooms.usePublishTopic(
    room,
    EVENTS.TOGGLE_THEME_SONG
  );

  return <Button onClick={() => toggleThemeSong(undefined)}>Theme Song</Button>;
};

const Button = ({
  children,
  ...attributes
}: {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 font-medium text-lg active:bg-blue-700 transition-colors w-full"
      {...attributes}
    >
      {children}
    </button>
  );
};
