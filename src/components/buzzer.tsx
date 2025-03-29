import { useState } from "react";

export default function Buzzer() {
  const [winner, setWinner] = useState<"left" | "right" | null>(null);

  const handleBuzz = (side: "left" | "right") => {
    if (winner === null) {
      setWinner(side);
    }
  };

  const resetBuzzer = () => {
    setWinner(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1">
        <div
          className={`flex-1 m-2 rounded-lg flex items-center justify-center cursor-pointer ${
            winner === "left" ? "bg-green-500" : "bg-blue-800"
          }`}
          onClick={() => handleBuzz("left")}
        >
          <div className="text-4xl font-bold">TEAM A</div>
        </div>
        <div
          className={`flex-1 m-2 rounded-lg flex items-center justify-center cursor-pointer ${
            winner === "right" ? "bg-green-500" : "bg-blue-800"
          }`}
          onClick={() => handleBuzz("right")}
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
