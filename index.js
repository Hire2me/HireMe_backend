const express = require('express');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./src/routes/auth.route');
require('./src/config/passport.setup');

dotenv.config();
const app = express();
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

 app.use('/auth', authRoutes);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
