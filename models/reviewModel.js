const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review cannot be empty'],
        },
        rating: {
            type: Number,
            min: [1, 'Min tour rating must be greater than 1'],
            max: [5, 'Max tour rating must be less than 5'],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

//Query Middleware
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo -_id',
    });
    next();
});

// Static Method because we need to call aggregate function on Model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                nRatings: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRatings,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};

//Indexes - One User can only write one review for each tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//Middleware Hooks
reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.tour);
});

// New way using Async Post Hooks (see mongoose doc or Q&A)
reviewSchema.post(/^findOneAnd/, async function (doc, next) {
    await doc.constructor.calcAverageRatings(doc.tour);
    next();
});

// Jacob Original Way
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//     this.r = await this.findOne();
//     next();
// });

// //Calling constructor on this.r (a query) gets you the model, which you
// // can then call the static function on
// reviewSchema.post(/^findOneAnd/, async function () {
//     await this.r.constructor.calcAverageRatings(this.r.tour);
// });

module.exports = mongoose.model('Review', reviewSchema);
