const {Schema, model} = require('mongoose');

const paymentInvoiceSchema = new Schema({
    seller: {
        ref: 'Duvi',
        type: Schema.Types.ObjectId
    },
    buyer: {
        ref: 'User',
        type: Schema.Types.ObjectId
    },
    purchase: [Object]
}, {
    timestamps: true,
    timeseries: true
});

module.exports = model('PaymentInvoice', paymentInvoiceSchema);