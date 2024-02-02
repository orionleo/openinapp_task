// app.ts

import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./sequelize";
import taskRoutes from "./routes/taskRoutes";
import subTaskRoutes from "./routes/subTaskRoutes";
import defineAssociations from "./sequelize/associations";
import cron from "node-cron";
import axios from "axios";
import Task from "./sequelize/models/task";
import userRoutes from "./routes/userRoutes";
// Load environment variables from .env file
dotenv.config();

// Create an Express application
export const app: Application = express();

// Middleware for CORS
app.use(cors());

// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Sample route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express and Sequelize!");
});

app.use("/tasks", taskRoutes);
app.use("/subtasks", subTaskRoutes);
app.use("/users", userRoutes);


cron.schedule("0 0 * * *", async () => {
  console.log("Cron job running");
  const res = await axios.patch("http://localhost:8000/tasks/update-tasks");
  const data = res.data;
  const statusMessages: Task[] = data.statusMessages;
  const res2 = await axios.post("http://localhost:8000/tasks/call-user", {
    tasks: statusMessages,
  });
  console.log(res2.data)
});

const PORT: number = Number(process.env.PORT!);
sequelize
  .authenticate()
  .then(() => {
    app.listen(PORT, async () => {
      // await sequelize.sync();
      defineAssociations();
      console.log(`Server running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
