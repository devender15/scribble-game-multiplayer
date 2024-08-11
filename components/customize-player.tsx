import { useUserStore } from "@/stores/user-store";
import validateUsername from "@/actions/validate-username";

import { CircleCheck, CircleX, Loader2 } from "lucide-react";

import * as z from "zod";
import { useCallback, useEffect } from "react";

const schema = z.object({
  name: z.string().min(3, "3 characters minimum"),
});

export default function CustomizePlayer() {
  const {
    name,
    setName,
    errorMessage,
    setErrorMessage,
    validationStatus,
    setValidationStatus,
    debouncedName,
    setDebouncedName,
  } = useUserStore();

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const validate = async (value: string) => {
    setValidationStatus("idle");
    setErrorMessage("");

    try {
      schema.parse({ name: value });
    } catch (error) {
      setValidationStatus("error");
      setErrorMessage("3 characters minimum");
      return;
    }

    setValidationStatus("loading");
    try {
      const isValid = await validateUsername(value);
      if (isValid) {
        setValidationStatus("success");
      } else {
        setValidationStatus("error");
        setErrorMessage("already taken, lol");
      }
    } catch (error) {
      setValidationStatus("error");
      setErrorMessage("already taken, lol");
    }
  };

  const debouncedValidate = useCallback(debounce(validate, 500), []);

  useEffect(() => {
    if (debouncedName.length >= 3) {
      debouncedValidate(debouncedName);
    } else if (debouncedName.length === 0) {
      setValidationStatus("idle");
      setErrorMessage("");
    } else {
      setValidationStatus("error");
      setErrorMessage("3 characters minimum");
    }
  }, [debouncedName, debouncedValidate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setName(value);

    setDebouncedName(value);
  };

  const STATUS_RENDER = {
    idle: <></>,
    loading: <Loader2 size={20} className="text-pink-500 animate-spin" />,
    success: <CircleCheck size={20} className="text-green-500" />,
    error: <CircleX size={20} className="text-red-500" />,
  };

  return (
    <div className="w-full flex flex-col gap-y-2 justify-center items-center">
      <div className="flex gap-x-4 items-center w-full justify-center">
        <input
          type="text"
          placeholder="a unique name"
          name="name"
          value={name}
          onChange={handleInputChange}
          autoFocus={true}
          className="border-none outline-none transition duration-500 p-2 h-fit text-violet-900 bg-pink-400/30 rounded-lg lowercase placeholder-violet-500 text-sm w-48"
        />
        <span className="">{STATUS_RENDER[validationStatus]}</span>
      </div>

      <span className="text-red-500 text-xs lowercase h-2">
        {errorMessage && errorMessage}
      </span>
    </div>
  );
}
