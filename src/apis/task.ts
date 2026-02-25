import axios from "axios";
import { Task } from "@/types/task";

const API = "http://localhost:4000/tasks";

export const getTasks = async () => {
  const { data } = await axios.get<Task[]>(API);
  return data;
};

export const createTask = async (task: Task) => {
  const { data } = await axios.post(API, task);
  return data;
};

export const updateTask = async (task: Task) => {
  const { data } = await axios.put(`${API}/${task.id}`, task);
  return data;
};

export const deleteTask = async (id: string) => {
  await axios.delete(`${API}/${id}`);
};