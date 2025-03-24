import clsx from "clsx";
import { useRef, useState } from "react";
import Balancer from "react-wrap-balancer";
import { db, EVENTS, room, SINGLETON_ID } from "../lib/db";
import { getCurrentQuestion } from "../lib/questions";
import type { GameState } from "../lib/types";

export default function Scoreboard() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const { data } = db.useQuery({
    gameState: {
      $: {
        where: {
          id: SINGLETON_ID,
        },
      },
    },
  });

  // if (!hasInteracted) {
  //   return (
  //     <div className="p-4">
  //       <button onClick={() => setHasInteracted(true)}>Start</button>
  //     </div>
  //   );
  // }

  if (!data) return null;

  const gameState = data.gameState[0] as unknown as GameState;

  const currentQuestion = getCurrentQuestion(gameState.currentQuestionId);
  if (currentQuestion === null) return null;

  return (
    <div className="min-h-dvh flex items-center">
      <div className="p-8 w-full">
        <Balancer className="text-5xl font-bold text-center !block mx-auto">
          {currentQuestion.question}
        </Balancer>
        <div className="mt-16">
          <Answers gameState={gameState} />
        </div>
        <div className="mt-16">
          <Scores gameState={gameState} />
        </div>
        <Strikes gameState={gameState} />
        <ThemeSongPlayer />
        <AnswerSoundPlayer />
      </div>
    </div>
  );
}

const playAudio = (url: string) => {
  const audio = new Audio(url);
  audio.play();
  return audio;
};

const Answers = ({ gameState }: { gameState: GameState }) => {
  const currentQuestion = getCurrentQuestion(gameState.currentQuestionId)!;

  const cutoff = Math.ceil(currentQuestion.answers.length / 2);
  const leftQuestions = currentQuestion.answers.slice(0, cutoff);
  const rightQuestions = currentQuestion.answers.slice(cutoff);

  return (
    <div className="grid grid-cols-2 gap-x-4 max-w-5xl mx-auto border-4 border-amber-300 rounded-4xl p-4 bg-blue-950">
      <div className="space-y-4">
        {leftQuestions.map((answer) => {
          return (
            <Answer
              key={answer.answer}
              text={answer.answer}
              points={answer.points}
              number={currentQuestion.answers.indexOf(answer) + 1}
              gameState={gameState}
            />
          );
        })}
      </div>
      <div className="space-y-4">
        {rightQuestions.map((answer) => {
          return (
            <Answer
              key={answer.answer}
              text={answer.answer}
              points={answer.points}
              number={currentQuestion.answers.indexOf(answer) + 1}
              gameState={gameState}
            />
          );
        })}
      </div>
    </div>
  );
};

const Answer = ({
  text,
  points,
  number,
  gameState,
}: {
  text: string;
  points: number;
  number: number;
  gameState: GameState;
}) => {
  const revealed = gameState.revealedAnswers.includes(text);

  return (
    <div className="rounded-2xl px-5 bg-gradient-to-b from-blue-500 to-blue-700 h-[68px]">
      {revealed ? (
        <div className="flex justify-between items-center gap-x-4 h-full">
          <p className="text-3xl font-bold">{text}</p>
          <p className="text-2xl font-semibold">{points}</p>
        </div>
      ) : (
        <div className="flex items-center h-full">
          <p className="text-3xl font-semibold text-center bg-blue-800 w-max mx-auto px-3 py-0.5 rounded-full">
            {number}
          </p>
        </div>
      )}
    </div>
  );
};

const Scores = ({ gameState }: { gameState: GameState }) => {
  return (
    <div className="max-w-5xl flex items-center gap-x-16 w-max mx-auto">
      <Score label="PM" score={gameState.teamAScore ?? 0} />
      <Score label="This Round" score={gameState.pendingScore ?? 0} large />
      <Score label="TL" score={gameState.teamBScore ?? 0} />
    </div>
  );
};

const Score = ({
  label,
  score,
  large = false,
}: {
  label: string;
  score: number;
  large?: boolean;
}) => {
  return (
    <div>
      <p className="text-2xl font-medium text-center">{label}</p>
      <div className="mt-2 bg-blue-500 px-8 py-4 rounded-3xl h-max">
        <p className={clsx("text-7xl font-bold", large && "text-8xl")}>
          {score}
        </p>
      </div>
    </div>
  );
};

const Strikes = ({ gameState }: { gameState: GameState }) => {
  const [showStrikes, setShowStrikes] = useState(false);
  const [isMax, setIsMax] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealStrikes = () => {
    setShowStrikes(true);

    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(() => {
      setShowStrikes(false);
      setIsMax(false);
    }, 1_500);
  };

  db.rooms.useTopicEffect(room, EVENTS.SHOW_STRIKES, revealStrikes);
  db.rooms.useTopicEffect(room, EVENTS.SHOW_MAX_STRIKES, () => {
    setIsMax(true);
    revealStrikes();
  });

  return (
    <div
      className={clsx(
        "bg-black/80 fixed inset-0 p-12",
        !showStrikes && "opacity-0 pointer-events-none",
        "transition-opacity duration-300"
      )}
    >
      <div className="h-full flex gap-x-8 items-center justify-center">
        {Array.from({ length: isMax ? 3 : gameState.strikeCount ?? 0 }).map(
          (_, index) => (
            <img key={index} src="/strike.png" className="w-64 h-64" />
          )
        )}
      </div>
    </div>
  );
};

const ThemeSongPlayer = () => {
  const isPlaying = useRef(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  db.rooms.useTopicEffect(room, EVENTS.TOGGLE_THEME_SONG, () => {
    if (isPlaying.current) {
      const fadeInterval = setInterval(() => {
        if (!audio.current) return;
        if (audio.current.volume > 0.1) {
          audio.current.volume -= 0.1;
        } else {
          clearInterval(fadeInterval);
          audio.current.volume = 0;
          audio.current?.pause();
          isPlaying.current = false;
        }
      }, 150);
    } else {
      audio.current = playAudio("/theme.mp3");
      isPlaying.current = true;
      audio.current?.addEventListener("ended", () => {
        isPlaying.current = false;
      });
    }
  });

  return null;
};

const AnswerSoundPlayer = () => {
  db.rooms.useTopicEffect(room, EVENTS.PLAY_CORRECT_ANSWER_SOUND, () => {
    playAudio("/correct.mp3");
  });

  db.rooms.useTopicEffect(room, EVENTS.PLAY_INCORRECT_ANSWER_SOUND, () => {
    playAudio("/incorrect.mp3");
  });

  return null;
};
