import React from "react";

const HighlightedWord = ({ word }) => {
  if (!word) return <span className="text-gray-400">…</span>;

  const mid = Math.floor(word.length / 2);

  return (
    <>
      {word.slice(0, mid)}
      <span className="bg-yellow-400 text-white px-2 py-1 rounded">
        {word[mid]}
      </span>
      {word.slice(mid + 1)}
    </>
  );
};

export default HighlightedWord;