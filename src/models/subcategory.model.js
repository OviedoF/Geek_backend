const {Schema, model} = require('mongoose');

const SubcategorySchema = new Schema({
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
    category: {
        ref: 'Category',
        type: Schema.Types.ObjectId,
        required: true
    }
});

module.exports = model('SubCategory', SubcategorySchema);