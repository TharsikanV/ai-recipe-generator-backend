import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Test route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});



// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  // PostgreSQL duplicate key error
  if (err.code === '23505') {
    return res.status(400).json({
      success: false,
      message: 'Email already exists',
    });
  }
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});