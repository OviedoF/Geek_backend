const mongoose = require('mongoose');
const uri = 'mongodb://127.0.0.1:27017/geek';
const testUri = `mongodb+srv://${process.env.USERNAME_DB}:${process.env.PASSWORD_DB}@cluster0.xfev8za.mongodb.net/${process.env.NAME_DB}?retryWrites=true&w=majority`;

// mongoose.connect(testUri, {
//     keepAlive: true,
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
//     .then(res => console.log(`DB is connected succesfully! ✨`))
//     .catch(err => console.log(err));

mongoose.connect(uri, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(res => console.log(`DB is connected succesfully! ✨`))
    .catch(err => console.log(err));

module.exports = mongoose;

