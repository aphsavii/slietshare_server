import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';


const app = express();

app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({ extended: true, limit:'16kb' }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(cors({origin:process.env.CORS_ORIGIN}));


// Routes import
import {userRouter} from './routes/user.routes.js';
import {qsRouter} from './routes/qs.routes.js';


app.get('/',(req,res)=>{
    res.send('hello world!!')
})
// Routes
app.use('/user', userRouter);
app.use('/qs', qsRouter);

export {app};