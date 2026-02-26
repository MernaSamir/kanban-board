import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client using env variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/tasks
export async function GET() {
  try {
    const { data, error } = await supabase.from("tasks").select("*");

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error("GET failed:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          ...body,
          created_at: new Date().toISOString(),
        },
      ])
      .select(); // ensures Supabase returns the inserted row

    if (error) {
      console.error("Supabase POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    console.error("POST failed:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}