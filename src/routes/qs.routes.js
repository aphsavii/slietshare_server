import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const qsRouter = Router();

// Routes import
import {
    uploadQs,
    approveQs,
    getQs,
    getAllPendingQs,
    deleteQs,
    getQsbyUser
} from '../controllers/qs.controller.js';

// Routes
qsRouter.get('/search', getQs);
qsRouter.post('/upload', upload.fields([{ name: 'qs', maxCount: 1 }]), verifyJwt, uploadQs);
qsRouter.post('/approve/:qsId', verifyJwt, approveQs);
qsRouter.get('/pending', getAllPendingQs);
qsRouter.delete('/delete/:qsId', verifyJwt, deleteQs);
qsRouter.get('/user/:userId', getQsbyUser);

export { qsRouter }