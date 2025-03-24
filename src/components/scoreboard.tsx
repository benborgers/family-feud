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
    <div className="p-8">
      <Balancer className="text-5xl font-bold text-center !block mx-auto">
        {currentQuestion.question}
      </Balancer>
      <div className="mt-8">
        <Answers gameState={gameState} />
      </div>
      <ThemeSongPlayer />
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
    <div className="grid grid-cols-2 gap-x-4 max-w-2xl mx-auto border-4 border-amber-300 rounded-2xl p-4 bg-blue-950">
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
    <div className="rounded-2xl px-5 py-4 bg-gradient-to-b from-blue-500 to-blue-700 h-[68px]">
      {revealed ? (
        <div className="flex justify-between items-center h-full">
          <p className="text-2xl font-bold">{text}</p>
          <p className="text-xl font-semibold">{points}</p>
        </div>
      ) : (
        <p className="text-2xl font-semibold text-center bg-blue-800 w-max mx-auto px-3 py-0.5 rounded-full">
          {number}
        </p>
      )}
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
