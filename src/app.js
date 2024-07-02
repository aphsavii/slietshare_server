import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { verifyJwt } from './middlewares/auth.middleware.js';
import {Server} from 'socket.io';
import { createServer } from 'http';
import { socketJwt } from './middlewares/socket-auth.middleware.js';
import { notificationEvents } from './webSockets/notification.scoket.js';
import { setActiveUser, removeActiveUser } from './webSockets/utils/index.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer,{
    cors: {
        origin: "*",
      },
    },
);

// Middlewares
io.use((socket,next)=>{
    socketJwt(socket,next);
});

app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({ extended: true, limit:'16kb' }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(cors({origin:process.env.CORS_ORIGIN, credentials:true}));

io.on('connection',(socket)=>{
    console.log('user connected',socket.id,"->",socket.user.regno);
    setActiveUser(socket.id,socket.user.regno);
    notificationEvents(socket);
    socket.on('disconnect',()=>{
        console.log('user disconnected',socket.id,"->",socket.user.regno);
        removeActiveUser(socket.user.regno);
    });
  
});


// Routes import
import {userRouter} from './routes/user.routes.js';
import {qsRouter} from './routes/qs.routes.js';
import { getMyProfile } from './controllers/user.controller.js';


app.get('/',(req,res)=>{
    res.send('hello world!!')
});

// Routes
app.use('/me',verifyJwt,getMyProfile);
app.use('/user', userRouter);
app.use('/qs', qsRouter);
export {httpServer,io};