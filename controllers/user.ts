import { Request, Response } from "express";
import Task from "../sequelize/models/task";
import { ParsedQs } from "qs";
import { ParamsDictionary } from "express-serve-static-core";
import User from "../sequelize/models/user";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

interface ReqBody {
  tasks: Task[];
  phoneNumber: bigint;
  priority: 0 | 1 | 2;
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

export const createUser = async (req: Request, res: Response) => {
  try {
    const { body } = req as Req;
    const { phoneNumber, priority } = body;

    if (
      !phoneNumber ||
      String(phoneNumber).length !== 10 ||
      (priority != 0 && priority != 1 && priority != 2)
    ) {
      throw Error(`Input right values for the user.`);
    } else {
      const user = await User.create({
        phone_number: phoneNumber,
        priority,
      });
      return res.status(200).json({message:"User created successfully",user})
    }
  } catch (error) {
    const e = error as unknown as Error;
    const errorMessage = e.message
    return res.status(400).json({errorMessage})
  }
};

export const callUser = async (req: Request, res: Response) => {
  try {
    const { body } = req as Req;
    const { tasks } = body;
    let users: User[] = [];

    // Fetch users for each task
    for (const task of tasks) {
      const user = await User.findOne({
        where: {
          id: task.dataValues.user_id,
        },
      });

      if (user !== null) {
        users.push(user);
      }
    }

    // Sort users by priority
    const sortedUsers = users.sort(
      (user1, user2) => user1.dataValues.priority - user2.dataValues.priority
    );

    // Initiate calls to sorted users
    for (const user of sortedUsers) {
      const call = await client.calls.create({
        method: "GET",
        url: "http://demo.twilio.com/docs/voice.xml",
        to: `+91${user.dataValues.phone_number}`,
        from: "+19306001125",
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));
      const calls = await client.calls.list();

      const currentCall = calls.filter(
        (call) => call.to === "+91" + user.dataValues.phone_number
      )[0];
      console.log(
        "CALL STATUS",
        currentCall.status,
        user.dataValues.phone_number
      );

      if (
        currentCall.status === "completed" ||
        currentCall.status === "in-progress"
      ) {
        return res.status(200).json({ message: "User call initiated." });
      } else {
        console.log(
          `User ${user.dataValues.phone_number} did not answer or the call failed.`
        );
      }
    }

    return res.status(400).json({ message: "No user picked up the call" });
  } catch (error) {
    console.error("Error in callUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
