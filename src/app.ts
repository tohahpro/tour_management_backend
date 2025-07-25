import express, {Application, Request, Response} from 'express';
import cors from "cors"
import { router } from './app/routes';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import { notFound } from './app/middlewares/notFound';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import expressSession from 'express-session';
import './app/config/passport';

const app : Application = express();

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(expressSession({
    secret: "Your secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(cors())

app.use("/api/v1", router) 



app.get('/', (req: Request, res: Response)=>{
    res.send('Welcome to TR Tour Management App');
})


app.use(globalErrorHandler)

// Create Not Found Route
app.use(notFound)


export default app;