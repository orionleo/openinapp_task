import { Request, Response } from "express";
import Task from "../sequelize/models/task";
import { ParsedQs } from "qs";
import { ParamsDictionary } from "express-serve-static-core";
import SubTask from "../sequelize/models/subTask";
import User from "../sequelize/models/user";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
interface ReqBody {
  tasks: Task[];
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

export const callUser = async (req: Request, res: Response) => {
  //   const { body } = req as Req;
  //   const { tasks } = body;
  //   let users: User[] = [];
  //   tasks.map((task) => {
  //     async function getUser() {
  //       const user = await User.findOne({
  //         where: {
  //           id: task.dataValues.user_id,
  //         },
  //       });
  //       if (user === null) {
  //         return;
  //       }
  //       users.push(user);
  //     }

  //     getUser();
  //   });
  //   const sortedUsers = users.sort(
  //     (user1, user2) => user1.dataValues.priority - user2.dataValues.priority
  //   );

  client.calls
    .create({
      method: "GET",
      statusCallback: "http://localhost:8000/users/get-call-status",
      statusCallbackEvent: ["initiated", "answered", "failed", "completed"],
      statusCallbackMethod: "POST",
      url: "http://demo.twilio.com/docs/voice.xml",
      to: `+918510029270`,
      from: "+19306001125",
    })
    .then((call) => console.log(call.status))
    .catch((error) => {
      console.error("Twilio API Error:", error);
    });

  return res.status(200);
};

export const getCallStatus = async (req: Request, res: Response) => {
  const statusUpdate = req.body;
  console.log(statusUpdate);
  return res.status(200).json({ statusUpdate }).end();
};
