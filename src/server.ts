/* eslint-disable no-console */
import {Server} from 'http';
import app from './app';
import mongoose from 'mongoose';
import { envVars } from './app/config/env';
import { seedSuperAdmin } from './app/utils/seedSuperAdmin';


let server : Server;

const PORT = envVars.PORT;

const startServer = async () =>{
  try {

      await mongoose.connect(envVars.DB_URL);  
      console.log("Connected to DB ");

      server = app.listen(PORT, () => {
            console.log(`App is listening on port ${PORT}`);
      });

  } catch (error) {
        console.log(error);
        
  }
}


(async()=>{
    await startServer()
    await seedSuperAdmin()
})()

process.on("uncaughtException", ()=>{
    console.log("Unhandled Rejection detected.... Server Shutting down.");
    
    if(server){
        server.close(()=>{
            process.exit(1)
        });
    }
    process.exit(1)
})

process.on("uncaughtException", ()=>{
    console.log("Uncaught Exception detected.... Server Shutting down.");
    
    if(server){
        server.close(()=>{
            process.exit(1)
        });
    }
    process.exit(1)
})

// throw new Error("I forgot to handle this local error")


process.on("SIGTERM", ()=>{
    console.log("SIGTERM signal received.... Server Shutting down.");
    
    if(server){
        server.close(()=>{
            process.exit(1)
        });
    }
    process.exit(1)
})


process.on("SIGINT", ()=>{
    console.log("SIGINT signal received.... Server Shutting down.");
    
    if(server){
        server.close(()=>{
            process.exit(1)
        });
    }
    process.exit(1)
})