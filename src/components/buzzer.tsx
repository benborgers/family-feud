import { useRef, useState } from "react";
import { db, EVENTS, room } from "../lib/db";

export default function Buzzer() {
  const [winner, setWinner] = useState<"left" | "right" | null>(null);
  const publishBuzzerWinner = db.rooms.usePublishTopic(
    room,
    EVENTS.BUZZER_WINNER
  );
  const lastTapTime = useRef<{ left: number; right: number }>({
    left: 0,
    right: 0,
  });

  const handleBuzz = (
    side: "left" | "right",
    event: React.TouchEvent | React.MouseEvent
  ) => {
    const currentTime = Date.now();
    const lastTap = lastTapTime.current[side];

    // Only process if this tap is within 50ms of the last tap
    // This helps handle simultaneous taps better
    if (currentTime - lastTap < 50) {
      if (winner === null) {
        setWinner(side);
        publishBuzzerWinner(side);
      }
    }

    lastTapTime.current[side] = currentTime;
  };

  const resetBuzzer = () => {
    setWinner(null);
    lastTapTime.current = { left: 0, right: 0 };
  };

  return (
    <div className="flex flex-col h-dvh">
      <div className="flex flex-1">
        <div
          className={`flex-1 m-2 rounded-lg flex items-center justify-center cursor-pointer ${
            winner === "left" ? "bg-emerald-600" : "bg-blue-800"
          }`}
          onClick={(e) => handleBuzz("left", e)}
          onTouchStart={(e) => handleBuzz("left", e)}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <div className="text-4xl font-bold">TEAM A</div>
        </div>
        <div
          className={`flex-1 m-2 rounded-lg flex items-center justify-center cursor-pointer ${
            winner === "right" ? "bg-emerald-600" : "bg-blue-800"
          }`}
          onClick={(e) => handleBuzz("right", e)}
          onTouchStart={(e) => handleBuzz("right", e)}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <div className="text-4xl font-bold">TEAM B</div>
        </div>
      </div>
      {winner !== null && (
        <div className="py-4 text-center">
          <button
            className="px-8 py-4 bg-blue-700 rounded-lg text-2xl font-bold"
            onClick={resetBuzzer}
          >
            RESET
          </button>
        </div>
      )}
    </div>
  );
}
