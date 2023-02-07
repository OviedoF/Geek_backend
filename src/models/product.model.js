const {Schema, model} = require('mongoose');

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        ref: 'Category',
        type: Schema.Types.ObjectId
    },
    subcategories: [{
        ref: 'SubCategory',
        type: Schema.Types.ObjectId
    }],
    tradable: {
        type: Boolean,
        required: true
    },
    salable: {
        type: Boolean,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    principalImage: {
        type: String,
        required: true
    },
    galleryImages: Array,   
    shop: {
        ref: "Shop",
        type: Schema.Types.ObjectId
    },
    comments: [{
        ref: "Comment",
        type: Schema.Types.ObjectId
    }],
    proposals: [{
        ref: "Proposal",
        type: Schema.Types.ObjectId
    }]
}, {
    timestamps: true
});

module.exports = model('Product', productSchema);