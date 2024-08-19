import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

import { useModalStore } from "@/stores/modal-store";
import { useRoomStore } from "@/stores/room-store";

import { useEffect, useState } from "react";
import axios from "axios";

export default function WordSelect() {
  const type = "word-select";

  const { setOpen, modalType } = useModalStore();
  const { setSelectedWord, selectedWord } = useRoomStore();

  const [words, setWords] = useState<string[]>([]);
  const [timer, setTimer] = useState(15);

  const handleSelectWord = (word: string) => {
    setSelectedWord(word);
    setOpen("");
  };

  const selectRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex];

    setSelectedWord(word);

    setOpen("");
  };

  useEffect(() => {
    const handleFetchWords = async () => {
      const res = await axios.get(
        "https://random-word-api.herokuapp.com/word?number=3"
      );
      const data = res.data;
      setWords(data);
    };

    handleFetchWords();
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (modalType !== type) {
      setTimer(15);
    } else {
      intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [modalType]);

  useEffect(() => {
    if (timer <= 0 && !selectedWord) {
      selectRandomWord();
    }
  }, [timer]);

  return (
    <Dialog open={modalType === type}>
      <DialogContent>
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="font-normal">select a word</DialogTitle>
          <p className="text-sm text-gray-500">{timer}</p>
        </DialogHeader>

        <div className="w-full flex items-center gap-x-5 justify-center text-xl">
          {words.map((word, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleSelectWord(word)}
            >
              {word}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
