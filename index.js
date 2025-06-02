const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./src/database/db');

const app = express();
app.use(express.json());
dotenv.config();

connectDB();


app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.use('/', (req,res) =>{
    res.send('welcome');
});

const PORT = process.env.PORT || 2200;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});