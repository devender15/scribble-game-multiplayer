"use client";

import WordSelect from "@/components/modals/word-select";
import RoundRecap from "@/components/modals/round-recap";
import NewLevel from "@/components/modals/new-level";
import GameOver from "@/components/modals/game-over";

export default function ModalProvider() {
  return (
    <>
      <WordSelect />
      <RoundRecap />
      <NewLevel />
      <GameOver />
    </>
  );
}
