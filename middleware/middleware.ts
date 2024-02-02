// authMiddleware.ts

import { Request as ExpressRequest, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
// Define a custom Request interface
interface RequestWithUser extends ExpressRequest {
  userId?:string
}

// Middleware function for authenticating with JWT
export const authenticateUser = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  dotenv.config();
  // Get the token from the Authorization header
  const token = req.headers.authorization;

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Missing token" });
  }

  // Verify the token
  jwt.verify(token, process.env.SECRET_KEY!, (err: any, decoded: any) => {
    if (err) {
      console.error(err);
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }

    // Attach the decoded user information to the request object
    req.userId = decoded?.userId
    next();
  });
};
