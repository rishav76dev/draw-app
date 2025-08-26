import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { prisma } from "@repo/db/client";
import cors from "cors";
import bcrypt from "bcrypt";

declare global {
  namespace Express {
    interface Request {
      userId?: string; // or number, depending on your user ID type
    }
  }
}


const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    res.json({
      message: "Incorrect inputs",
    });
    return;
  }
  try {
    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: parsedData.data?.username,
        password: hashedPassword,
        name: parsedData.data.name,
      },
    });
    res.json({
      userId: user.id,
    });
  } catch (e) {
    console.error("Signup failed:", e);

    res.status(500).json({ message: "Failed to create user" });
  }
});

app.post("/signin", async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect inputs",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: parsedData.data.username,
      },
    });

    if (!user) {
      res.status(403).json({
        message: "Not authorized",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      parsedData.data.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const token = jwt.sign(
      {
        userId: user?.id,
      },
      JWT_SECRET
    );

    res.json({
      token,
    });
  } catch (e) {
    console.error("Signin failed:", e);
    res.status(500).json({ message: "Failed to sign in" });
  }
});

app.post("/room", middleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect inputs",
    });
    return;
    }

    const userId = req.userId;
    if (userId == undefined) {
      res.status(401).json({
        message: "Unauthorized - User ID not found",
      });
      return;
    }

  try {
    const room = await prisma.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });

    res.json({
      roomId: room.id,
    });
  } catch (e) {
    res.status(409).json({
      message: "Room already exists with this name",
    });
  }
});

app.get("/chats/id/:roomId", async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);

    const messages = await prisma.chat.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        id: "desc",
      },
      take: 50,
    });

    res.json({
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      error: "Failed to fetch messages",
    });
  }
});

app.get("/chats/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const room = await prisma.room.findMany({
      where: {
        slug,
      },
    });

    res.json({
      room,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({
      error: "Failed to fetch room",
    });
  }
});

app.listen(3001);
