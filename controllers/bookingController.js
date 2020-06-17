const stripe = require('stripe')('sk_test_51Gv1lVDBso6ygppOrtDovM99s2w0g5uPmM0QUabRf4weRgFIQ2sDUyBPxRcoNJYq44wTl8KphiiHfBhJZpkMdWoz00eFu3rk3I');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1. Get currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    //2. Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: `${req.user.email}`,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: `${tour.summary}`,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1,
            },
        ],
    });

    //3. Send to client
    res.status(200).json({
        status: 'success',
        session: session,
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    //Temp solution
    const { tour, user, price } = req.query;
    if (!tour || !user || !price) return next();

    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking);

exports.createBooking = factory.createOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);

exports.updateBooking = factory.updateOne(Booking);
