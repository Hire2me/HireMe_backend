require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const connectDatabase = require('./src/database/config');


const artisanRoutes = require('./src/routes/artisan.route');
const adminRoutes = require('./src/routes/admin.route');
const userRoutes = require('./src/routes/user.route');


const app = express();


connectDatabase();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});


app.use('/public', express.static(path.join(__dirname, 'src/public')));


app.use('/api/artisans', artisanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'Welcome to FindArtisan API' });
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