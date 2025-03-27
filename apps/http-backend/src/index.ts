import express from 'express';
import 

const app = express();
app.listen(5000, () => {
  console.log('Server is running on http://localhost:3000');
});
            
app.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

});

app.post('/login', (req, res) => {\
});


app.post('/room', middleware, (req, res) => {\
});