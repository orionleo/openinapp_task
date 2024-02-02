import express from "express";

import { createTask, deleteTask, getAllTasksForUser, updateTask, updateTaskPriority } from "../controllers/tasks";
import { authenticateUser } from "../middleware/middleware";

let taskRoutes = express.Router();

taskRoutes.post("/create-task",authenticateUser,createTask)
taskRoutes.get("/get-tasks/:userId",getAllTasksForUser);
taskRoutes.patch("/update-task/:taskId",updateTask);
taskRoutes.delete("/delete-task/:taskId",deleteTask);
taskRoutes.patch("/update-tasks",updateTaskPriority);

export default taskRoutes;
