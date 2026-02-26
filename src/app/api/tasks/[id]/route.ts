import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ unwrap promise
    if (!id) {
      return NextResponse.json({ error: "Missing task id" }, { status: 400 });
    }

    const updatedData = await req.json();

    const { data, error } = await supabase
      .from("tasks")
      .update(updatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase PUT error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("PUT failed:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ unwrap promise
    if (!id) {
      return NextResponse.json({ error: "Missing task id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .select(); // ensures deleted row is returned

    if (error) {
      console.error("Supabase DELETE error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE failed:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}