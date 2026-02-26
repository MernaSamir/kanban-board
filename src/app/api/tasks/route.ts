import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "db.json");

function readDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ tasks: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDB(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// GET /api/tasks
export async function GET() {
  const db = readDB();
  return NextResponse.json(db.tasks);
}

// POST /api/tasks
export async function POST(req: Request) {
  const body = await req.json();
  const db = readDB();

  const newTask = {
    id: Date.now().toString(),
    ...body,
  };

  db.tasks.push(newTask);
  writeDB(db);

  return NextResponse.json(newTask, { status: 201 });
}