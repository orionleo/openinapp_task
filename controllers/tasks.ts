import { Request, Response } from "express";
import Task from "../sequelize/models/task";
import { ParsedQs } from "qs";
import { ParamsDictionary } from "express-serve-static-core";
import SubTask from "../sequelize/models/subTask";

interface ReqBody {
  title?: string;
  description?: string;
  due_date?: string;
  status?: string;
}

interface ReqParams extends ParamsDictionary {
  userId: string;
  taskId: string;
}

interface ReqQuery extends ParsedQs {
  page: string;
  priority: "0" | "1" | "2";
  due_date: string;
}

interface Req extends Request {
  userId: string;
  params: ReqParams;
  body: ReqBody;
  query: ReqQuery;
}

export const createTask = async (req: Request, res: Response) => {
  try {
    const { userId } = req as Req;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { body } = req as Req;
    const { title, description, due_date } = body;

    if (!title || !description || !due_date) {
      res.status(400).json({ message: "Data is missing" });
      return;
    }

    const dueDate = new Date(due_date);
    const currentDate = new Date();

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daysRemaining = Math.ceil(
      (dueDate.getTime() - currentDate.getTime()) / millisecondsPerDay
    );
    console.log(daysRemaining);

    let priority = 0;

    if (daysRemaining == 0) priority = 0;
    else if (daysRemaining >= 1 && daysRemaining <= 2) priority = 1;
    else if (daysRemaining >= 3 && daysRemaining <= 4) priority = 2;
    else if (daysRemaining >= 5) priority = 3;
    else {
      return res
        .status(400)
        .json({ message: "The task is already past the due date" });
    }

    const task = await Task.create({
      user_id: userId,
      due_date: due_date,
      title,
      description,
      priority,
    });

    res.status(200).json({ task });
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllTasksForUser = async (req: Request, res: Response) => {
  try {
    const pageCount = 8;
    const { params, query } = req as Req;
    const {
      priority: givenPriority,
      due_date: givenDueDate,
      page: givenPage,
    } = query;

    const priority =
      givenPriority !== undefined ? parseInt(givenPriority) : undefined;
    const page = givenPage !== undefined ? parseInt(givenPage) : undefined;
    const dueDate =
      givenDueDate !== undefined ? new Date(givenDueDate) : undefined;
    console.log("DUE DATE", dueDate);

    const { userId } = params;
    if (!userId) {
      return res.status(400).json({ message: "No user id" });
    }

    const tasks = await Task.findAll({ where: { user_id: userId } });

    let filteredTasks = tasks;
    if (givenPriority) {
      filteredTasks = filteredTasks.filter((task) => task.priority == priority);
    }

    if (dueDate) {
      filteredTasks = filteredTasks.filter(
        (task) => task.due_date && new Date(task.due_date) <= new Date(dueDate)
      );
    }

    if (page) {
      const startIndex = (page - 1) * pageCount;
      const endIndex = startIndex + pageCount;
      filteredTasks = filteredTasks.slice(startIndex, endIndex);
    }

    if (filteredTasks.length > 0) {
      res.status(200).json(filteredTasks);
    } else {
      res
        .status(400)
        .json({ message: "No task with the given filters", filteredTasks });
    }
  } catch (error) {
    console.error("Error in getAllTasksForUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { body, params } = req as Req;

    const { due_date, status } = body;
    const { taskId } = params;

    const task = await Task.findOne({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (
      due_date !== undefined &&
      (status === "DONE" || status === "TODO" || status === "IN_PROGRESS")
    ) {
      await Task.update(
        { due_date: new Date(due_date), status: status },
        { where: { id: taskId } }
      );
      if (status === "DONE") {
        const subtasks = await SubTask.findAll({
          where: {
            task_id: taskId,
          },
        });
        console.log("SUBTASKS", subtasks);
        if (subtasks.length && subtasks.length > 0) {
          for (const subTask of subtasks) {
            await SubTask.update(
              {
                status: 1,
              },
              {
                where: {
                  id: subTask.dataValues.id,
                },
              }
            );
          }
        }
      }

      const updatedTask = await Task.findOne({ where: { id: taskId } });
      console.log(updatedTask);
      return res.status(200).json({ updatedTask });
    } else if (due_date !== undefined) {
      await Task.update(
        { due_date: new Date(due_date) },
        { where: { id: taskId } }
      );
      const updatedTask = await Task.findOne({ where: { id: taskId } });
      console.log(updatedTask);
      return res.status(200).json({ updatedTask });
    } else if (
      status === "DONE" ||
      status === "TODO" ||
      status === "IN_PROGRESS"
    ) {
      await Task.update({ status: status }, { where: { id: taskId } });
      const updatedTask = await Task.findOne({ where: { id: taskId } });
      if (status === "DONE") {
        const subtasks = await SubTask.findAll({
          where: {
            task_id: taskId,
          },
        });
        console.log("SUBTASKS", subtasks);
        if (subtasks.length && subtasks.length > 0) {
          for (const subTask of subtasks) {
            await SubTask.update(
              {
                status: 1,
              },
              {
                where: {
                  id: subTask.dataValues.id,
                },
              }
            );
          }
        }
      }
      console.log(updatedTask);
      return res.status(200).json({ updatedTask });
    } else {
      return res.status(400).json({ message: "Invalid request" });
    }
  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { params } = req as Req;
    const { taskId } = params;

    const task = await Task.findOne({ where: { id: taskId } });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subTasks = await SubTask.findAll({ where: { task_id: taskId } });
    subTasks.map(async (subtask) => {
      await SubTask.destroy({ where: { id: subtask.dataValues.id } });
    });
    await Task.destroy({ where: { id: taskId } });

    return res
      .status(200)
      .json({ message: "Tasks and Sub Tasks Successfully Deleted" });
  } catch (error) {
    const e = error as unknown as any;
    const message = e.message;
    console.error("Error in deleteTask:", error);
    res.status(500).json({ message });
  }
};

export const updateTaskPriority = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.findAll();
    let statusMessages: Task[] = [];
    tasks.map(async (task) => {
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      const dueDate = new Date(task.dataValues.due_date);
      const currentDate = new Date();
      const daysRemaining = Math.ceil(
        (dueDate.getTime() - currentDate.getTime()) / millisecondsPerDay
      );
      console.log(daysRemaining);

      let priority = 0;

      if (daysRemaining == 0) priority = 0;
      else if (daysRemaining >= 1 && daysRemaining <= 2) priority = 1;
      else if (daysRemaining >= 3 && daysRemaining <= 4) priority = 2;
      else if (daysRemaining >= 5) priority = 3;
      else {
        priority = task.dataValues.priority - 1;
        statusMessages.push(task);
      }

      await Task.update({ priority }, { where: { id: task.dataValues.id } });
    });

    const updatedTasks = await Task.findAll();
    return res.status(200).json({ updatedTasks, statusMessages });
  } catch (error) {
    console.error("Error in updateTaskPriority:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
