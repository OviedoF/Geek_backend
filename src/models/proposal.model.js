const {Schema, model} = require('mongoose');

const proposalSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    amount: {
        type: Number
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    images: {
        type: Array
    },
    status: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = model('Proposal', proposalSchema);