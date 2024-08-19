import { useEffect, useState } from "react";

export default function GuessWord({ word }: { word: string }) {
  const [revealedWord, setRevealedWord] = useState("_".repeat(word.length));
  const [revealIndex, setRevealIndex] = useState(1);

  useEffect(() => {
    const revealNextLetter = () => {
      if (revealIndex < word.length) {
        let updatedWord = revealedWord.split("");
        updatedWord[revealIndex] = word[revealIndex];
        setRevealedWord(updatedWord.join(""));
        setRevealIndex(revealIndex + 1);
      }
    };

    const timer = setInterval(revealNextLetter, 20000);

    return () => clearInterval(timer);
  }, [word, revealIndex, revealedWord]);

  return (
    <div className="flex space-x-2 items-center">
      {revealedWord.split("").map((letter, index) => (
        <span key={index} className="border-b-2 border-gray-400 text-xl">
          {letter}
        </span>
      ))}

      <span className="text-gray-400">({word.length})</span>
    </div>
  );
}
