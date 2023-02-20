const {Schema, model} = require('mongoose');

const shopSchema = new Schema({
    profileImage: {
        type: String,
        required: true
    },
    bannerImage: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    comunne: {
        type: String,
        required: true
    },
    direction: {
        type: String,
        required: true
    },
    social_media: {
        website: String,
        whatsapp: String,
        facebook: String,
        instagram: String,
        youtube: String,
        linkedin: String,
        tiktok: String,
        twitter: String
    },  
    cellPhone: String,
    email: String,
    products: [{
        ref: "Product",
        type: Schema.Types.ObjectId
    }],
    comments: [{
        ref: "Comment",
        type: Schema.Types.ObjectId
    }],
    posts: [{
        ref: "Post",
        type: Schema.Types.ObjectId
    }],
    salesHistory: [{
        ref: "Purchase",
        type: Schema.Types.ObjectId
    }],
    notifications: [{
        subject: String,
        message: String,
        redirect: String
    }]
});

module.exports = model('Shop', shopSchema);