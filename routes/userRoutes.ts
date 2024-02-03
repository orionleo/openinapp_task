import express from "express";

import { callUser, createUser } from "../controllers/user";

let userRoutes = express.Router();

userRoutes.post("/call-users",callUser)
userRoutes.post("/create-user",createUser)


export default userRoutes;
