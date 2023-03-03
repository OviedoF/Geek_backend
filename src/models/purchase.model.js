const { Schema, model } = require("mongoose");

const purchaseSchema = new Schema({
  state: {
    type: String,
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
  rupies: Boolean,
  amount: Number,
  trade: Boolean,
  shippingBuyer: {
    state: String,
    city: String,
    address: String,
    code: String,
  },
  shippingSeller: {
    state: String,
    city: String,
    address: String,
    code: String,
  },
}, {
    timestamps: true,
    timeseries: true
});

module.exports = model("Purchase", purchaseSchema);
