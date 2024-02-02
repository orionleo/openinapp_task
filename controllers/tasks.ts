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
  const { userId } = req as Req;
  if (userId == undefined) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { body } = req as Req;
  const { title, description, due_date } = body;

  if (
    !title ||
    !description ||
    !due_date ||
    title == undefined ||
    description == undefined ||
    due_date == undefined
  ) {
    res.status(400).json({ message: "Data is missing" });
    return;
  }

  const dueDate = new Date(due_date);
  const currentDate = new Date();

  const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

  const daysRemaining = Math.ceil(
    (dueDate.getTime() - currentDate.getTime()) / millisecondsPerDay
  );
  console.log(daysRemaining);

  let priority = 0;

  if (daysRemaining > 0 && daysRemaining < 1) priority = 0;
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
};

export const getAllTasksForUser = async (req: Request, res: Response) => {
  const pageCount = 8;
  const { params, query } = req as Req;
  const {
    priority: givenPriority,
    due_date: givenDueDate,
    page: givenPage,
  } = query;

  //converting priority and page to number and due_date to a Date format
  const priority =
    givenPriority !== undefined ? parseInt(givenPriority) : undefined;
  const page = givenPage !== undefined ? parseInt(givenPage) : undefined;
  const dueDate =
    givenDueDate !== undefined ? new Date(givenDueDate) : undefined;
  console.log("DUE DATE", dueDate);
  const { userId } = params;

  if (userId == undefined) {
    return res.status(400).json({ message: "No user id" });
  }

  const tasks = await Task.findAll({
    where: { user_id: userId },
  });
  // console.log(priority, page, dueDate, tasks);

  // Apply filters based on priority
  let filteredTasks = tasks;
  if (givenPriority) {
    filteredTasks = filteredTasks.filter((task) => task.priority == priority);
    // console.log("FILTERED_TASKS",filteredTasks);
  }

  if (dueDate) {
    // console.log("typeof dueDate",typeof dueDate)
    filteredTasks = filteredTasks.filter((task) => {
      // Assuming task.due_date is a Date object
      return task.due_date && new Date(task.due_date) <= new Date(dueDate);
    });
  }

  if (page) {
    const startIndex = (page - 1) * pageCount;
    const endIndex = startIndex + pageCount;
    filteredTasks = filteredTasks.slice(startIndex, endIndex);
  }
  if (filteredTasks.length > 0) {
    res.status(200).json(filteredTasks);
    return;
  } else {
    res
      .status(400)
      .json({ message: "No task with the given filters", filteredTasks });
    return;
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const { body, params } = req as Req;

  const { due_date, status } = body;

  const { taskId } = params;

  const task = await Task.findOne({
    where: {
      id: taskId,
    },
  });
  if (!task) {
    return;
  }
  if (
    due_date !== undefined &&
    (status === "DONE" || status === "TODO" || status === "IN_PROGRESS")
  ) {
    await Task.update(
      { due_date: new Date(due_date), status: status },
      {
        where: {
          id: taskId,
        },
      }
    );

    const task = await Task.findOne({
      where: {
        id: taskId,
      },
    });
    console.log(task);
    return;
  } else if (due_date !== undefined) {
    await Task.update(
      { due_date: new Date(due_date) },
      {
        where: {
          id: taskId,
        },
      }
    );
    const task = await Task.findOne({
      where: {
        id: taskId,
      },
    });
    console.log(task);
    return;
  } else if (
    status === "DONE" ||
    status === "TODO" ||
    status === "IN_PROGRESS"
  ) {
    await Task.update(
      { status: status },
      {
        where: {
          id: taskId,
        },
      }
    );
    const task = await Task.findOne({
      where: {
        id: taskId,
      },
    });
    console.log(task);
    return;
  } else {
    return;
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const { params } = req as Req;
  const { taskId } = params;
  await Task.destroy({
    where: {
      id: taskId,
    },
  });
  const subTasks = await SubTask.findAll({
    where: {
      task_id: taskId,
    },
  });
  subTasks.map((subtask) => {
    async function deleteSubTask() {
      await SubTask.destroy({
        where: {
          id: subtask.dataValues.id,
        },
      });
    }
    deleteSubTask();
  });
  return res
    .status(200)
    .json({ message: "Tasks and Sub Tasks Successfully Delete" });
};

export const updateTaskPriority = async (req: Request, res: Response) => {
  const tasks = await Task.findAll();
  let statusMessages: Task[] = [];
  tasks.map((task) => {
    async function changePriority() {
      const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
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
      await Task.update(
        { priority },
        {
          where: {
            id: task.dataValues.id,
          },
        }
      );
    }
    changePriority();
  });
  const updatedTasks = await Task.findAll();
  return res.status(200).json({ updatedTasks, statusMessages });
};
