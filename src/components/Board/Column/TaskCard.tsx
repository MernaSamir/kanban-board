"use client";

import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Box,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { Task } from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "@/apis/task";

export default function TaskCard({
  task,
  onEdit,
}: {
  task: Task;
  onEdit?: (task: Task) => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id || "",
    data: task,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.id && window.confirm(`Delete "${task.title}"?`)) {
      deleteMutation.mutate(task.id);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 2,
        cursor: "grab",
        "&:hover .delete-button, &:hover .edit-button": { opacity: 1 },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box {...attributes} {...listeners} sx={{ flex: 1, cursor: "grab" }}>
            <Typography fontWeight="bold">{task.title}</Typography>

            <Typography variant="body2" sx={{ mb: 1, mt: 1 }}>
              {task.description}
            </Typography>

            {task.priority && (
              <Chip
                label={task.priority}
                size="small"
                color={
                  task.priority === "high"
                    ? "error"
                    : task.priority === "medium"
                      ? "warning"
                      : "default"
                }
              />
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            {[
              {
                icon: <EditIcon fontSize="small" />,
                onClick: () => onEdit?.(task),
                hoverColor: "primary.main",
              },
              {
                icon: <DeleteIcon fontSize="small" />,
                onClick: handleDelete,
                hoverColor: "error.main",
                disabled: deleteMutation.isPending,
              },
            ].map(({ icon, onClick, hoverColor, disabled }, i) => (
              <IconButton
                key={i}
                size="small"
                onClick={onClick}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                disabled={disabled}
                sx={{
                  opacity: 0.7,
                  transition: "opacity 0.2s",
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  minHeight: 32,
                  "&:hover": {
                    backgroundColor: hoverColor,
                    color: "white",
                    borderRadius: "50%",
                  },
                }}
              >
                {icon}
              </IconButton>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
