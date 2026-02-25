import Board from "@/components/Board";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kanban Board",
  description: "A simple Kanban board app",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Board />
    </div>
  );
}
