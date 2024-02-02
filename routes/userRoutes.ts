import express from "express";

import { callUser, getCallStatus } from "../controllers/user";

let userRoutes = express.Router();

userRoutes.post("/call-users",callUser)
userRoutes.post('/get-call-status',getCallStatus)


export default userRoutes;
