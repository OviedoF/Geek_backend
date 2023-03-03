const mongoose = require('mongoose');
const deepPopulate = require('mongoose-deep-populate')(mongoose);

const productSchema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.ObjectId
    },
    subCategory: {
        ref: 'SubCategory',
        type: mongoose.Schema.Types.ObjectId
    },
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
        type: mongoose.Schema.Types.ObjectId
    },
    comments: [{
        ref: "Comment",
        type: mongoose.Schema.Types.ObjectId
    }],
    proposals: [{
        ref: "Proposal",
        type: mongoose.Schema.Types.ObjectId
    }],
    finished: {
        type: Boolean,
        required: true
    },
    inProcess: {
        type: Boolean,
        required: true
    },
}, {
    timestamps: true
});

productSchema.plugin(deepPopulate)

module.exports = mongoose.model('Product', productSchema);