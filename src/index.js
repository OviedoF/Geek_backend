const path = require('path');
const app = require(path.join(__dirname, 'app.js')); // Bring app (express) object
require('dotenv').config(); 
const SocketIO = require('socket.io');

const port = process.env.PORT || 4000; // env PORT or default PORT

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port} 🧐`);
}); 

const io = SocketIO(server, {
    cors: {
        origin: "*"
    }
});

// websockets

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('message', (message) => {
        console.log(message);

        io.sockets.emit('response', {message: 'chao'});
    });

    socket.on('buy-local-request', (data) => { // Cuando el usuario pide productos al vendedor
        console.log(data);
        io.sockets.emit(`buyforlocal-${data.sellerId}`, {message: 'Hicieron una nueva petición a tu local!'})
    });

    socket.on('buy-shipping-request', (data) => {
        console.log(data);
        io.sockets.emit(`buyforshipping-${data.sellerId}`, {message: 'Tienes un nuevo envío a confirmar!'})
    })

    socket.on('purchase-local-confirm', (data) => {
        io.sockets.emit(`purchase-local-confirm-${data.idBuyer._id}`)
    })
    
});

module.exports = server;