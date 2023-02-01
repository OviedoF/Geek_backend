const {Schema, model} = require('mongoose');

const postSchema = new Schema({
    author: {
        ref: "Duvi",
        type: Schema.Types.ObjectId
    },
    content: {
        type: String,
        required: true
    },
    images: Array,
    likes: [{
        ref: 'User',
        type: Schema.Types.ObjectId
    }],
    dislikes: [{
        ref: 'User',
        type: Schema.Types.ObjectId
    }]
}, {
    timestamps: true
});

module.exports = model('Post', postSchema);