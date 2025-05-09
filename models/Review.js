const moongose = require('mongoose');
const reviewSchema = new moongose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,   
    }
} , {timestamps:true})
let Review = moongose.model('Review', reviewSchema);
module.exports = Review;