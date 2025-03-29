import { useState } from "react";
import { db, EVENTS, room } from "../lib/db";

export default function Buzzer() {
  const [winner, setWinner] = useState<"left" | "right" | null>(null);
  const publishBuzzerWinner = db.rooms.usePublishTopic(
    room,
    EVENTS.BUZZER_WINNER
  );

  const handleBuzz = (side: "left" | "right") => {
    if (winner === null) {
      setWinner(side);
      publishBuzzerWinner(side);
    }
  };

  const resetBuzzer = () => {
    setWinner(null);
  };

  return (
    <div className="flex flex-col h-dvh">
      <div className="flex flex-1">
        <div
          className={`flex-1 m-2 rounded-lg flex items-center justify-center cursor-pointer ${
            winner === "left" ? "bg-emerald-600" : "bg-blue-800"
          }`}
          onClick={() => handleBuzz("left")}
          style={{
            WebkitTapHighlightColor: "transparent",
            touchAction: "none",
          }}
        >
          <div className="text-4xl font-bold">TEAM A</div>
        </div>
        <div
          className={`flex-1 m-2 rounded-lg flex items-center justify-center cursor-pointer ${
            winner === "right" ? "bg-emerald-600" : "bg-blue-800"
          }`}
          onPointerDown={() => handleBuzz("right")}
          style={{
            WebkitTapHighlightColor: "transparent",
            touchAction: "none",
          }}
        >
          <div className="text-4xl font-bold">TEAM B</div>
        </div>
      </div>
      {winner !== null && (
        <div className="py-4 text-center">
          <button
            className="px-8 py-4 bg-blue-700 rounded-lg text-2xl font-bold"
            onPointerDown={resetBuzzer}
          >
            RESET
          </button>
        </div>
      )}
    </div>
  );
}
