const app =  require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');

//handle the unccaught exceptions
process.on('uncaughtException',err =>{
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down the server due to uncaught exception');
    server.close(() =>{
        process.exit(1);
    })
})
///setting is config
dotenv.config({path: 'backend/config/config.env'})


///connecting to database
connectDatabase();
const server = app.listen(process.env.PORT, () => {
    console.log(`server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});

//handle unhandled Promise rejaction 
process.on('unhandledRejection', err =>{
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down the server due to inhandled promise rejaction');
    server.close(() =>{
        process.exit(1);
    })
})