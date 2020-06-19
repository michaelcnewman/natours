const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });
    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }
    res.status(200).render('tour', { title: tour.name, tour: tour });
});

exports.getOverview = catchAsync(async (req, res, next) => {
    // Get All Tour Data from Collection
    const tours = await Tour.find();

    //Render Template using tour data from 1
    res.status(200).render('overview', {
        title: 'All Tours',
        tours: tours,
    });
});

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account',
    });
};

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', { title: 'Log into your account' });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser,
    });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
    //1. Find all Bookings
    const bookings = await Booking.find({ user: req.user.id });

    //2. Find Tours with returned IDs
    const tourIDs = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My tours',
        tours: tours,
    });
});

exports.alerts = (req, res, next) => {
    const { alert } = req.query;
    if (alert === 'booking') {
        res.locals.alert =
            'Your booking was successful. Please check your email for a confirmation. If your booking does not show up immediately. Please come back later.';
    }
    next();
};
