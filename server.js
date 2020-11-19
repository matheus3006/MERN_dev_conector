 const express = require('express');
 const connectDB = require('./config/db');

 const app = express();

//  Connect DB:
connectDB();

//Init middleware (so we can use req.body)
app.use(express.json({extend:false}));

app.get('/', (req,res)=> res.send('API running'));

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));


 const PORT = process.env.PORT || 5000;
 app.listen(PORT, () => console.log(`server running or port ${PORT} ` )); 