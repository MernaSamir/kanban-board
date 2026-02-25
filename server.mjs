import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Load tasks from db.json
const dbFile = 'db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
let tasks = db.tasks || [];

const saveTasks = () => fs.writeFileSync(dbFile, JSON.stringify({ tasks }, null, 2));

console.log(`Loaded ${tasks.length} tasks from ${dbFile}`);

// GET all tasks
app.get('/tasks', (req, res) => res.json(tasks));

// POST a new task
app.post('/tasks', (req, res) => {
  const newTask = { id: Date.now().toString(), ...req.body };
  tasks.push(newTask);
  saveTasks();
  res.json(newTask);
});

// PUT update a task
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  Object.assign(task, req.body);
  saveTasks();
  res.json(task);
});

// DELETE a task
app.delete('/tasks/:id', (req, res) => {
  tasks = tasks.filter(t => t.id !== req.params.id);
  saveTasks();
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));