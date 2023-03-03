const mongoose = require("mongoose");
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userImage: String,
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    cellphone: String,
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    roles: [{
        ref: 'Role',
        type: mongoose.Schema.Types.ObjectId
    }],

    shop: {
        ref: 'Shop',
        type: mongoose.Schema.Types.ObjectId
    },
    
    wishList: [{
        ref: "Product",
        type: mongoose.Schema.Types.ObjectId
    }],

    shoppingCart: [{
        ref: "Product",
        type: mongoose.Schema.Types.ObjectId
    }],

    follows: [{
        ref: "Shop",
        type: mongoose.Schema.Types.ObjectId
    }],

    shoppingHistory: [{
        ref: "Purchase",
        type: mongoose.Schema.Types.ObjectId
    }],

    wallet: {
        balance: Number,
        pending: Number,
        readyPay: Boolean,
    },

    notifications: [{
        subject: String,
        message: String,
        redirect: String
    }],

    directions: [{
        name: String,
        region: String,
        commune: String,
        street: String,
        number: String,
        departament: String,
        details: String,
    }],

    transactions: [{}]
}, {
    timestamps: true
});

userSchema.plugin(deepPopulate);

userSchema.statics.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}
userSchema.statics.comparePassword = async (password, receivedPassword) => {
    return await bcrypt.compare(password, receivedPassword);
}

module.exports = mongoose.model('User', userSchema);