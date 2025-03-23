import { useRef, useState } from "react";
import { db, EVENTS, room } from "../lib/db";

export default function Scoreboard() {
  const [hasInteracted, setHasInteracted] = useState(false);

  if (!hasInteracted) {
    return (
      <div className="p-4">
        <button onClick={() => setHasInteracted(true)}>Start</button>
      </div>
    );
  }

  return (
    <div>
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
    }
  });

  return null;
};
