import express from 'express';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware';
import { JWT_SECRET } from '@repo/backend-common/key1';
import { CreateUserSchema , SigninSchema, CreateRoomSchema} from '@repo/common/types';
import { prismaClient } from '@repo/db/prismaclient';

const app = express();
app.use(express.json());
       
app.post('/signup', async (req, res) => {

  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid data",
    });
    return;
  }

  try {
    const user =await prismaClient.user.create({
        data: {
            email: parsedData.data?.username,
            password: parsedData.data.password,
            name: parsedData.data.name
        }
    })
    res.json({
        userId: user.id
    })
} catch(e) {
    res.status(411).json({
        message: "User already exists with this username"
    })
}


  res.json({
    
    message: 'User created'
    
  })
});

app.post('/login', async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if(!parsedData.success){
    res.json({
      message: "Incorrect inputs"
    })
  return;
  }

  const user = await prismaClient.user.findFirst({
    where: {
        email: parsedData.data.username,
        password: parsedData.data.password
    }
})

if (!user) {
    res.status(403).json({
        message: "Not authorized"
    })
    return;
}
  
  const token = jwt.sign({
    userId: user?.id
  }, JWT_SECRET);
  

  res.json({
    token
  })
});


app.post('/room', middleware, async (req, res) => {

  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid input",
    });
    return;
  }

  const userId = req.userId;

  try {
    const room = await prismaClient.room.create({
        data: {
            slug: parsedData.data.name,
            adminId: userId
        }
    })

    res.json({
        roomId: room.id
    })
} catch(e) {
    res.status(411).json({
        message: "Room already exists with this name"
    })
}
});


app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  const messages = await prismaClient.chat.findMany({
      where: {
          roomId: roomId
      },
      orderBy: {
          id: "desc"
      },
      take: 50
  });

  res.json({
      messages
  })
});

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
      