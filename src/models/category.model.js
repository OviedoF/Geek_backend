const {Schema, model} = require('mongoose');

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    subCategories: [{
        ref: "SubCategory",
        type: Schema.Types.ObjectId
    }]
});

module.exports = model('Category', categorySchema);