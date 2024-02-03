import express from "express";


import { authenticateUser } from "../middleware/middleware";
import { createSubTask, deleteSubTask, getAllSubTasksForUser, updateSubTask } from "../controllers/subtasks";

let subTaskRoutes = express.Router();

subTaskRoutes.post("/create-sub-task",createSubTask)
subTaskRoutes.get("/get-sub-tasks/:userId",getAllSubTasksForUser);
subTaskRoutes.patch("/update-sub-task/:subTaskId",updateSubTask);
subTaskRoutes.delete("/delete-sub-task/:subTaskId",deleteSubTask);

export default subTaskRoutes;
