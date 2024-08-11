import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import joinRoom from "@/actions/join-room";
import { useUserStore } from "@/stores/user-store";

type JoinRoomProps = {
  setMode: (mode: "join" | "") => void;
};

const schema = z.object({
  roomCode: z.string().length(6, "must be 6 characters"),
});

export default function JoinRoom({ setMode }: JoinRoomProps) {
  const { name } = useUserStore();

  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      roomCode: "",
    },
  });

  const handleBackArrow = () => {
    setMode("");
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const { roomCode } = data;
    
    try {
      await joinRoom(roomCode, name);
      router.push(`/room?code=${roomCode}`);
      toast("room joined!", {
        action: {
          label: "okay",
          onClick: () => {
            toast.dismiss();
          },
        },
      });
    } catch (error: any) {
      console.log(error);
      toast(error);
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="w-[55%] flex items-center justify-between">
        <button onClick={handleBackArrow}>
          <ArrowLeft size={25} xlinkTitle="Back" />
        </button>

        <h1 className="text-2xl font-medium lowercase">Join Room</h1>
      </div>

      <div className="w-full h-full flex justify-center items-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="roomCode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input
                      placeholder="room code"
                      className="rounded-lg text-sm p-2 h-8 text-purple-900 placeholder-purple-600 outline-none focus:ring-0 bg-pink-400/50"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              variant={"outline"}
              className="lowercase w-full rounded-xl bg-pink-500 hover:bg-pink-600 transition-all outline-none ring-0 border-none text-pink-200 hover:text-pink-100"
              type="submit"
              disabled={!form.formState.isValid}
            >
              join
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
