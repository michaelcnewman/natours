const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

//Middleware so we can use factory function
exports.setTourUserIds = (req, res, next) => {
    //Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourid;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

exports.getAllReviews = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);
