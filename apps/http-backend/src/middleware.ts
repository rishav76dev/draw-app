import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";
import { }

export const middleware = (req: Request, res: Response, next: NextFunction) => { 
    const token = req.headers["authorization"] ?? "";
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded) {
        req.userId = decoded.userId;
        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }

};
