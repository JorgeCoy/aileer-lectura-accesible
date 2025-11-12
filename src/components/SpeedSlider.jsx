import React from "react";

const SpeedSlider = ({ speed, setSpeed, vertical = false }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex justify-between mb-1 w-full">
        <span className="text-sm">Velocidad: {speed} ms</span>
      </div>
      <input
        type="range"
        min="10"
        max="3000"
        step="50"
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        className={`w-full accent-accent ${vertical ? 'h-64 w-4 rotate-90 transform origin-center md:rotate-0 md:h-4 md:w-64' : ''}`}
      />
    </div>
  );
};

export default SpeedSlider;