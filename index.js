require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const connectDatabase = require('./src/database/db.js');
const passport = require('passport');
const session = require('express-session');
require('./src/config/passport.setup.js');
const { isAuthenticated } = require('./src/middleware/auth.js');
const authRoute = require('./src/routes/auth.route.js')


const artisanRoutes = require('./src/routes/artisan.route');
//const adminRoutes = require('./src/routes/admin.route');
//const userRoutes = require('./src/routes/user.route');


const app = express();


connectDatabase();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'src/views')));

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});


// app.use('/public', express.static(path.join(__dirname, 'src/public')));


app.use('/api/artisans', artisanRoutes);
app.use('/auth', authRoute)
//app.use('/api/admin', adminRoutes);
//app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
    res.send( 'Welcome to HireMe API' );
});


app.get('/', (req,res)=> {
    res.sendFile(path.join(__dirname, 'src/views/home.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/login.html'));
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'src/views/dashboard.html'));
    // res.send('welcome');
});
app.get('/api/users/profile', (req, res) => {
    console.log("User Data in /api/users/profile:", req.user); // Debugging log

    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json({
        firstName: req.user.firstName || 'N/A',
        lastName: req.user.lastName || 'N/A',
        email: req.user.email || 'N/A',
        googleId: req.user.googleId || null,
        profilePicture: req.user.profilePicture || ''
    });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Resource not found'
    });
});


const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});