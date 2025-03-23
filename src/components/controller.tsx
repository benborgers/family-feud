import { db, EVENTS, room } from "../lib/db";

export default function Controller() {
  return (
    <div className="p-4">
      <ThemeSongButton />
    </div>
  );
}

const ThemeSongButton = () => {
  const toggleThemeSong = db.rooms.usePublishTopic(
    room,
    EVENTS.TOGGLE_THEME_SONG
  );

  return <Button onClick={() => toggleThemeSong(undefined)}>Theme Song</Button>;
};

const Button = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-lg active:bg-blue-700 transition-colors w-full"
      onClick={onClick}
    >
      {children}
    </button>
  );
};
