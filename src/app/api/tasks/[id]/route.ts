import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ✅ db.json is in PROJECT ROOT
const dbFile = path.join(process.cwd(), "db.json");

const readTasks = () => {
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ tasks: [] }, null, 2));
    return [];
  }

  const data = fs.readFileSync(dbFile, "utf-8");
  return JSON.parse(data).tasks ?? [];
};

const saveTasks = (tasks: any[]) => {
  fs.writeFileSync(dbFile, JSON.stringify({ tasks }, null, 2));
};

// ✅ UPDATE TASK
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const updatedData = await req.json();

    const tasks = readTasks();
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    tasks[index] = { ...tasks[index], ...updatedData };
    saveTasks(tasks);

    return NextResponse.json(tasks[index]);
  } catch (err) {
    console.error("PUT failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ DELETE TASK
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const tasks = readTasks();
    const exists = tasks.some((t) => t.id === id);

    if (!exists) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTasks = tasks.filter((t) => t.id !== id);
    saveTasks(updatedTasks);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}