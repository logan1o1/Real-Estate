import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './Routes/auth.route.js';
import userRouter from './routes/users.route.js';
import cookieParser from 'cookie-parser'
import listingRouter from './routes/listing.route.js';
import path from 'path'

dotenv.config()
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.log(err);
  });

  const __dirname = path.resolve();

const app = express();
app.use(express.json())
app.use(cookieParser())



app.listen(3000, () => console.log("server is running on port 3000"))

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/listing', listingRouter)


app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
})


app.use((err, req, resp, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal server error"
    return resp.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
})