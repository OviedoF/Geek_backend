const {Schema, model} = require('mongoose');

const commentSchema = new Schema({
    author: {
        ref: "User",
        type: Schema.Types.ObjectId
    },
    comment: {
        type: String,
        required: true
    },
    commentedIn: Schema.Types.ObjectId,
    stars: Number
}, {
    timestamps: true
});

module.exports = model('Comment', commentSchema);