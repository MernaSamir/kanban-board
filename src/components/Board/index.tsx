"use client";
import {   Typography, Button, Box, TextField, InputAdornment } from "@mui/material";

import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import Column from "./Column";
import CreateTaskModal from "../CreateTaskModal";
import TaskCard from "./Column/TaskCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTasks, updateTask } from "@/apis/task";
import { DndContext, DragEndEvent, DragOverlay, closestCenter, DragStartEvent } from "@dnd-kit/core";
import { Task } from "@/types/task";
import { useState } from "react";

const columns = ["Backlog", "In progress", "Review", "Done"];

export default function Board() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const queryClient = useQueryClient();

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setCreateModalOpen(true);
  };

  const mutation = useMutation({
    mutationFn: updateTask,
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<Task[]>(["tasks"], (oldTasks) =>
        oldTasks ? oldTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)) : []
      );
    },
    onError: (error) => {
      console.error("Failed to update task:", error);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current as Task;
    setActiveTask(task);
  }

 function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;

  if (!over) {
    setActiveTask(null);
    return;
  }
  const activeTask = active.data.current as Task;
  const newColumn = over.id as string;
  if (!["Backlog", "In progress", "Review", "Done"].includes(newColumn)) {
    setActiveTask(null);
    return;
  }
  if (activeTask.column !== newColumn) {
    mutation.mutate({ ...activeTask, column: newColumn });
  }
  setActiveTask(null);
}
  return (
    <>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <Box sx={{ mb: 3, px: { xs: 1, sm: 2, md: 3 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              mb: 2,
              gap: 1,
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "#1976d2" }}
            >
              Kanban Board ({tasks.length} tasks)
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              sx={{ mt: { xs: 1, sm: 0 } }}
            >
              Add Task
            </Button>
          </Box>

          <TextField
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { xs: "100%", sm: 400 } }}
          />
        </Box>

 <Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 2,
    px: { xs: 0.5, sm: 2, md: 3 },
  }}
>
  {columns.map((col) => (
    <Box
      key={col}
      sx={{
        flex: "1 1 100%", // mobile: full width
        maxWidth: { xs: "100%", sm: "48%", md: "23%" }, // responsive widths
      }}
    >
      <Column
        column={col}
        tasks={tasks}
        searchQuery={searchQuery}
        onEdit={handleEditTask}
      />
    </Box>
  ))}
</Box>
      </DndContext>

      <DragOverlay>
        {activeTask && (
          <div
            style={{
              transform: "rotate(5deg)",
              opacity: 0.8,
              pointerEvents: "none",
            }}
          >
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>

      <CreateTaskModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask || undefined}
      />
    </>
  );
}