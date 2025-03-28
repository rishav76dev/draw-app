import express from 'express';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware';
import { JWT_SECRET } from './config';

const app = express();
app.listen(5000, () => {
  console.log('Server is running on http://localhost:3000');
});
            
app.post('/signup', (req, res) => {
  res.json({
    //DB CALL
    message: 'User created'
    
  })
});

app.post('/login', (req, res) => {
  const userId =1;
  const token = jwt.sign({
    userId
  }, JWT_SECRET)

  res.json({
    token
  })
});


app.post('/room', middleware, (req, res) => {



  res.json({
    roomId: 1134
  })
});

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
      