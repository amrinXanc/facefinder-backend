const express = require('express');
const app = express();
require('dotenv').config();
require('./Models/db'); // your DB connection

const ProductRouter = require('./Routes/ProductRouter');
const AuthRouter  = require('./Routes/AuthRouter');

const PORT = process.env.PORT || 8080;

// CORS setup using your FRONT_END_URL environment variable
const cors = require('cors');
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://facefinder-frontend.vercel.app" // deployed frontend
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow curl/Postman
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error("CORS not allowed for this origin"), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// Explicitly handle OPTIONS preflight requests
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
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
