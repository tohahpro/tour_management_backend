import express, {Application, Request, Response} from 'express';
import cors from "cors"
import { router } from './app/routes';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import { notFound } from './app/middlewares/notFound';


const app : Application = express();

app.use(express.json())
 app.use(cors())

app.use("/api/v1", router) 



app.get('/', (req: Request, res: Response)=>{
    res.send('Welcome to TR Tour Management App');
})


app.use(globalErrorHandler)

// Create Not Found Route
app.use(notFound)


export default app;