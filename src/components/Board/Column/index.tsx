import { Paper, Typography, Pagination, Box } from "@mui/material";
import TaskCard from "./TaskCard";
import { Task } from "@/types/task";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useEffect, useMemo } from "react";

const TASKS_PER_PAGE = 5;

export default function Column({
  column,
  tasks,
  searchQuery = "",
  onEdit,
}: {
  column: string;
  tasks: Task[];
  searchQuery?: string;
  onEdit?: (task: Task) => void;
}) {
  const [page, setPage] = useState(1);
  const { setNodeRef, isOver } = useDroppable({ id: column });

  // Normalize safely
  const normalize = (value?: string) =>
    (value ?? "").toLowerCase().replace(/\s+/g, "_");

  const query = normalize(searchQuery);

  // SAFE filtering (NO crashes)
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesColumn =
        normalize(task.column) === normalize(column);

      const matchesSearch =
        !query ||
        normalize(task.title).includes(query) ||
        normalize(task.description).includes(query);

      return matchesColumn && matchesSearch;
    });
  }, [tasks, column, query]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filteredTasks.length]);

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = useMemo(() => {
    const start = (page - 1) * TASKS_PER_PAGE;
    return filteredTasks.slice(start, start + TASKS_PER_PAGE);
  }, [filteredTasks, page]);

  return (
    <Paper
      ref={setNodeRef}
      sx={{
        p: 2,
        height: "80vh",
        overflowY: "auto",
        backgroundColor: isOver ? "#e3f2fd" : "#f5f6f8",
        transition: "background-color 0.2s",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {column.toUpperCase()} ({filteredTasks.length})
      </Typography>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <SortableContext
          items={paginatedTasks.map(t => t.id).filter(Boolean)}
          strategy={verticalListSortingStrategy}
        >
          {paginatedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))}
        </SortableContext>
      </Box>

      {totalPages > 1 && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            size="small"
            color="primary"
          />
        </Box>
      )}
    </Paper>
  );
}