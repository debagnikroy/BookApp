const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const expressValidator = require('express-validator');
require('dotenv').config();

// import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/books');


const app=express();


app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

mongoose.connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
}).then(() => console.log('DB Connected'));

app.use('/api', authRoutes);

app.use('/api', userRoutes);
app.use('/api', bookRoutes);


const port = process.env.PORT || 8001;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});