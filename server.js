const app = require('./app');

const dotenv = require('dotenv');
const connectDataBase = require('./config/database')

// handeling Uncaught exception
process.on("uncaughtException" , (err)=> {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`)
    process.exit(1)
})


// config
 dotenv.config({ path: 'Backend/config/config.env' })

// connect to data base
connectDataBase()

const server = app.listen(process.env.PORT , ()=>{
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
})


// unhandle promis rejection
process.on('unhandledRejection' , err=>{
    console.log(`Error : ${err.message}`);
    console.log("shutting down the server due to un-handle Promise rejection");

    server.close(()=>{
        process.exit(1)
    })
})