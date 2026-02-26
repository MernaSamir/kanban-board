import axios from "axios";
import { Task } from "@/types/task";

const API = "/api/tasks";

// GET all tasks
export const getTasks = async () => {
  const { data } = await axios.get<Task[]>(API);
  return data;
};

// CREATE task
export const createTask = async (task: Omit<Task, "id">) => {
  const { data } = await axios.post<Task>(API, task);
  return data;
};

// UPDATE task
export const updateTask = async (task: Task) => {
  const { data } = await axios.put<Task>(`${API}/${task.id}`, task);
  return data;
};

// DELETE task
export const deleteTask = async (id: string) => {
  await axios.delete(`${API}/${id}`);
};