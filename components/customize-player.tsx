import { useUserStore } from "@/stores/user-store";

export default function CustomizePlayer() {
  const { name, setName } = useUserStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setName(value);
  };

  return (
    <div className="w-full flex justify-center">
      <input
        type="text"
        placeholder="enter name"
        name="name"
        value={name}
        onChange={handleInputChange}
        className="border-none outline-none p-2 h-fit text-violet-900 bg-pink-400/30 rounded-lg lowercase placeholder-violet-500 text-sm w-48"
      />
    </div>
  );
}
