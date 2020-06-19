const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1.) GLOBAL MIDDLEWARES
//Implement Cross Origin Resource Sharing CORS
app.use(cors()); // allows cors for all routes, can use as middle wear in any route
//If on same domain but different subdomain  e.g. api.natours.com vs. natours.com use below
// app.use(cors({origin: 'https://www.natours.com'}))

//Allow CORS for more complicated requests
app.options('*', cors());

// Servnig static files
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTML Headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit API
const limiter = rateLimit({
    max: 100,
    windowMS: 60 * 60 * 1000,
    message: 'Too many request from this IP.',
});

app.use('/api', limiter);

// Body Parser, reading data in body and limiting size
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//Cookie Parser
app.use(cookieParser());

// Sanitize data in body against nosql injection
app.use(mongoSanitize());

// Sanitize data in body against xss attacks
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsAverage',
            'ratingsQuantity',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 2.) MOUNT ROUTERS
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// 3.) UNHANDLED ROUTES
app.all('*', (req, res, next) => {
    next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

// 4.) ERROR HANDLING
app.use(globalErrorHandler);

module.exports = app;
