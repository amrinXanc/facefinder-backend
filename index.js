const express = require('express');
const app = express();
require('dotenv').config();
require('./Models/db'); // your DB connection

const ProductRouter = require('./Routes/ProductRouter');
const AuthRouter  = require('./Routes/AuthRouter');

const PORT = process.env.PORT || 8080;

// CORS setup
const cors = require('cors');

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / curl without origin

      // Allow localhost
      if (origin === "http://localhost:5173") {
        return callback(null, true);
      }

      // Allow production frontend
      if (origin === "https://facefinder-frontend.vercel.app") {
        return callback(null, true);
      }

      // Allow Vercel preview deployments
      if (/^https:\/\/facefinder-frontend-.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // Block everything else
      return callback(new Error("CORS not allowed for this origin"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests globally
app.options('*', cors());

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
