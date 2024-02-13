const  express = require('express');
const app = express();

const errorMiddleware = require('./middlewares/errors.js');


app.use(express.json());

//import all routes
const products = require('./routes/product.js');
const auth = require('./routes/auth.js');

app.use('/api/v1',products);
app.use('/api/v1',auth);


//Middleware to handle errors
app.use(errorMiddleware);

module.exports = app;
