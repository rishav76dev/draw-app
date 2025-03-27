import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";
import { JWT_SECRET
 } from "./config";

export const middleware = (req: Request, res: Response, next: NextFunction) => { 
    const token = req.headers["authorization"] ?? "";
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded) {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }

};
