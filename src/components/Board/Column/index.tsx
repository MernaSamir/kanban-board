import { Paper, Typography, Pagination, Box } from "@mui/material";
import TaskCard from "./TaskCard";
import { Task } from "@/types/task";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";

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

  // Filter tasks by column and search query
  const filteredTasks = tasks.filter((t) => 
    t.column === column &&
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice((page - 1) * TASKS_PER_PAGE, page * TASKS_PER_PAGE);

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
        <SortableContext items={paginatedTasks?.map(t => t.id).filter((id): id is string => id !== undefined)} strategy={verticalListSortingStrategy}>
          {paginatedTasks?.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))}
        </SortableContext>
      </Box>

      {totalPages > 1 && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, value) => setPage(value)}
            size="small"
            color="primary"
          />
        </Box>
      )}
    </Paper>
  );
}