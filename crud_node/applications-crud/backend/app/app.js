/**
 * Author:Diego Casallas
 * Date: 2025-05-27
 * Description: 
*/
import express from 'express';
import cors from 'cors';
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


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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



app.use((rep, res, nex) => {
  res.status(404).json({
    message: 'Endpoint losses'
  });
});

export default app;