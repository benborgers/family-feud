import { useRef, useState } from "react";
import Balancer from "react-wrap-balancer";
import { db, EVENTS, room, SINGLETON_ID } from "../lib/db";
import { getCurrentQuestion } from "../lib/questions";

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

  if (!hasInteracted) {
    return (
      <div className="p-4">
        <button onClick={() => setHasInteracted(true)}>Start</button>
      </div>
    );
  }

  if (!data) return null;

  const gameState = data.gameState[0];

  const currentQuestion = getCurrentQuestion(gameState.currentQuestionId);
  if (currentQuestion === null) return null;

  return (
    <div className="p-8">
      <Balancer className="text-5xl font-bold text-center !block mx-auto">
        {currentQuestion.question}
      </Balancer>
      <ThemeSongPlayer />
    </div>
  );
}

const playAudio = (url: string) => {
  const audio = new Audio(url);
  audio.play();
  return audio;
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
