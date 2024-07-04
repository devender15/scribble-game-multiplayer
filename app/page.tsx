import WelcomeSection from "@/components/welcome-section";
import GameMode from "@/components/game-mode";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-[#ddd6f3] to-[#faaca8] gap-y-5">
      <WelcomeSection /> 
      <GameMode />     
    </main>
  );
}
