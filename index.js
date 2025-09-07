const express = require('express');
const app = express();
require('dotenv').config();
require('./Models/db'); // your DB connection

const ProductRouter = require('./Routes/ProductRouter');
const AuthRouter  = require('./Routes/AuthRouter');

const PORT = process.env.PORT || 8080;

// CORS setup using your FRONT_END_URL environment variable
const cors = require('cors');
app.use(cors({
    origin: process.env.FRONT_END_URL || 'http://localhost:5173',
    credentials: true
}));

// Body parser middleware
app.use(express.json());

// Test route
app.get('/ping', (req, res) => {
    res.send('PONG');
});

// Routes
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
