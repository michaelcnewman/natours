const stripe = require('stripe')('sk_test_51Gv1lVDBso6ygppOrtDovM99s2w0g5uPmM0QUabRf4weRgFIQ2sDUyBPxRcoNJYq44wTl8KphiiHfBhJZpkMdWoz00eFu3rk3I');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1. Get currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    //2. Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: `${req.user.email}`,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: `${tour.summary}`,
                images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
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

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//     //Temp solution
//     const { tour, user, price } = req.query;
//     if (!tour || !user || !price) return next();

//     await Booking.create({ tour, user, price });

//     res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.display_items[0].amount / 100;
    await Booking.create({ tour, user, price });
};

exports.webhookCheckout = async (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'checkout.session.completed') {
            await createBookingCheckout(event.data.object);
            res.status(200).json({ received: true });
        }
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }
};

exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking);

exports.createBooking = factory.createOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);

exports.updateBooking = factory.updateOne(Booking);
