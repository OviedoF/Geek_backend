const {Schema, model} = require('mongoose');

const roleSchema = new Schema({
    name: {
        required: true,
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = model('Role', roleSchema);