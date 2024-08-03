const express = require("express");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require("cors");
const cron = require("node-cron");
const HttpException = require('./utils/HttpException.utils');
const errorMiddleware = require('./middleware/error.middleware');
const userRouter = require('./routes/api/user.route');
const walletRouter = require('./routes/api/wallet.route');
const subscriberRouter = require('./routes/api/subscriber.route');
const ieo = require('./routes/api/ieo.route');
const p2p = require('./routes/api/p2p.route');
const WalletService = require('./services/wallet.service');

dotenv.config();

// Init express
const app = express();

// parse requests of content-type: application/json
// parses incoming requests with JSON payloads
app.use(express.json());
app.use(cookieParser());

// Configure CORS middleware
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true, // Allows cookies to be sent and received
};
app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// session configuration
app.use(session({
  key: "user_sid",
  secret: "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 86400000,
  },
}));

// Cron job
cron.schedule('*/10 * * * *', () => {
  WalletService.updateTopTokens().then(() => {
    console.log("Top Token data updated");
  });
});

const port = Number(process.env.PORT || 4000);

// Routes
app.use('/api/users/', userRouter);
app.use('/api/wallets/', walletRouter);
app.use('/api/subscribers', subscriberRouter);
app.use('/api/ieo', ieo);
app.use('/api/p2p', p2p);

// 404 error
app.all('*', (req, res, next) => {
  const err = new HttpException(404, 'Endpoint Not Found');
  next(err);
});

// Error middleware
app.use(errorMiddleware);

// Starting the server
app.listen(port, () => console.log(`🚀 Server running on port ${port}!`));

module.exports = app;
