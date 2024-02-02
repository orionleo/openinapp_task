import express, { Request, Response } from "express";
import Task from "../sequelize/models/task";
import SubTask from "../sequelize/models/subTask";
import { Op, where } from "sequelize";

interface Req extends Request {
  userId: string;
  body: {
    taskId: string;
    status: 0 | 1;
  };
  params: {
    userId: string;
    subTaskId: string;
  };
  query: {
    taskId: string;
  };
}

export const createSubTask = async (req: Request, res: Response) => {
  const { userId } = req as Req;
  const { body } = req as Req;
  const { taskId } = body;
  const subTask = await SubTask.create({
    task_id: taskId,
    status: 0,
  });
  res.status(200).json({});
};

export const getAllSubTasksForUser = async (req: Request, res: Response) => {
  const { query, params } = req as Req;
  const { taskId } = query;
  const { userId } = params;

  console.log(taskId, userId);

  if (taskId == undefined) {
    // Retrieve all sub-tasks associated with the user's tasks
    const tasks = await Task.findAll({ where: { user_id: userId } });
    const subtasks = await SubTask.findAll({
      where: {
        task_id: {
          [Op.in]: tasks.map((task) => task.id),
        },
      },
    });
    console.log(subtasks);
    res.status(200).json({ subtasks });
    return;
  } else {
    const task = await Task.findOne({ where: { id: taskId } });
    if (!task) {
      return;
    }
    const subtasks = await SubTask.findAll({
      where: {
        task_id: task.id,
      },
    });
    console.log(subtasks);
    res.status(200).json({ subtasks });
    return;
  }
};

export const updateSubTask = async (req: Request, res: Response) => {
  const { params, body } = req as Req;
  const { status } = body;
  const { subTaskId } = params;

  if (
    (status !== 0 && status !== 1) ||
    (subTaskId !== undefined && subTaskId.trim().length > 0)
  ) {
    await SubTask.update({ status }, { where: { id: subTaskId } });

    const subTask = (await SubTask.findOne({
      where: {
        id: subTaskId,
      },
    })) as SubTask;
    if (status === 1) {
      const task = (await Task.findOne({
        where: {
          id: subTask.dataValues.task_id,
        },
      })) as Task;
      if (task.dataValues.status === "TODO") {
        await Task.update(
          { status: "IN_PROGRESS" },
          {
            where: {
              id: task.id,
            },
          }
        );
      }
    }

    console.log(subTask);
    return res.status(200).json({ subTask });
  }
};

export const deleteSubTask = async (req: Request, res: Response) => {
  const { params } = req as Req;
  const { subTaskId } = params;
  await SubTask.destroy({
    where: {
      id: subTaskId,
    },
  });
  const subTask = await SubTask.findOne({
    where: {
      id: subTaskId,
    },
  });
  console.log(subTask);
  return res.status(200).json({ message: "Successfully Delete" });
};
