import express from "express";

import { callUser } from "../controllers/user";

let userRoutes = express.Router();

userRoutes.post("/call-users",callUser)


export default userRoutes;
