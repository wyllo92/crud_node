/**
 * Author:Diego Casallas
 * Date: 2025-05-27
 * Description: 
*/
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
/* The routers are imported to handle specific routes in the application.*/
import uploadFile from '../routers/uploadFile.router.js';
import documentTypeRouter from '../routers/documentType.router.js';
import roleRouter from '../routers/role.router.js';
import userStatusRouter from '../routers/userStatus.router.js';
import userRouter from '../routers/user.router.js';
import apiUserRouter from '../routers/apiUser.router.js';
import profileRouter from '../routers/profile.router.js';
import tokenRouter from '../routers/token.router.js';
import userRoleRouter from '../routers/userRole.router.js';
import moduleRouter from '../routers/module.router.js';
import moduleRoleRouter from '../routers/moduleRole.router.js';


const app = express();

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/data/uploads', express.static(path.join(__dirname, '../data/uploads')));

// Prefix for all profile routes, facilitating scalability
app.use('/api_v1',uploadFile);
app.use('/api_v1',documentTypeRouter);
app.use('/api_v1',roleRouter);
app.use('/api_v1',userStatusRouter);	
app.use('/api_v1',userRouter);	
app.use('/api_v1',apiUserRouter);	
app.use('/api_v1',profileRouter);	
app.use('/api_v1',tokenRouter);
app.use('/api_v1',userRoleRouter);
app.use('/api_v1',moduleRouter);
app.use('/api_v1',moduleRoleRouter);



app.use((rep, res, nex) => {
  res.status(404).json({
    message: 'Endpoint losses'
  });
});

export default app;