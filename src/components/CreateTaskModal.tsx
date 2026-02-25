// components/CreateTaskModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask } from "@/apis/task";
import { Task } from "@/types/task";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
}

export default function CreateTaskModal({ open, onClose, task }: CreateTaskModalProps) {
  const isEditing = !!task;
  const queryClient = useQueryClient();

  // Lazy initialize form data
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    column: task?.column || "backlog",
    priority: task?.priority || "",
  });

  useEffect(() => {
  if (!open) return; 

  const timeout = setTimeout(() => {
    setFormData({
      title: task?.title || "",
      description: task?.description || "",
      column: task?.column || "backlog",
      priority: task?.priority || "",
    });
  }, 0);

  return () => clearTimeout(timeout);
}, [open, task]);

  // Mutation for create or update task
  const mutation = useMutation({
    mutationFn: isEditing ? updateTask : createTask,
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<Task[]>(["tasks"], (oldTasks) => {
        if (!oldTasks) return [updatedTask];
        return isEditing
          ? oldTasks.map((t) => (t.id === task!.id ? updatedTask : t))
          : [...oldTasks, updatedTask];
      });

      onClose();

      // Reset form only after creating a new task
      if (!isEditing) {
        setFormData({
          title: "",
          description: "",
          column: "backlog",
          priority: "",
        });
      }
    },
    onError: (error) => {
      console.error("Failed to save task:", error);
    },
  });

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const taskData: Task = {
      ...(isEditing && { id: task!.id }),
      title: formData.title.trim(),
      description: formData.description.trim(),
      column: formData.column,
      ...(formData.priority && { priority: formData.priority }),
    };

    mutation.mutate(taskData);
  };

  // Handle input/select changes
  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value as string,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={handleChange("title")}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleChange("description")}
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Column</InputLabel>
              <Select
                value={formData.column}
                onChange={handleChange("column")}
                label="Column"
              >
                <MenuItem value="backlog">Backlog</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={handleChange("priority")}
                label="Priority"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formData.title.trim() || mutation.isPending}
          >
            {mutation.isPending
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Task"
              : "Create Task"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}