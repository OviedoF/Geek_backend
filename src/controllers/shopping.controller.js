require("dotenv").config();
const path = require("path");
const User = require(path.join(__dirname, "..", "models", "user.model"));
const Shop = require(path.join(__dirname, "..", "models", "shop.model"));
const Product = require(path.join( __dirname, "..", "models", "product.model.js"));
const Purchase = require(path.join( __dirname, "..", "models", "purchase.model.js" ));
const PaymentInvoice = require(path.join( __dirname, "..", "models", "paymentInvoice.model.js" ));
const server = require(path.join( __dirname, "..", "index.js"));
const SocketIO = require('socket.io');

const shoppingController = {};

shoppingController.authorizeLocalShopping = async (req, res) => {
    try {
        const {id} = req.params;

        const purchaseActualized = await Purchase.findByIdAndUpdate(id, {
            state: "Confirmada"
        }).populate('seller');

        await User.findByIdAndUpdate(purchaseActualized.buyer, {
            '$addToSet': {
                'notifications': {
                    subject: "Retiro en local confirmado.",
                    message: `El retiro en ${purchaseActualized.seller.name} ha sido confirmado.`,
                    redirect: `/user/${purchaseActualized.buyer}/local-purchase`
                }
            }
        });

        res.status(200).send('Compra confirmada.');
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

shoppingController.endLocalShopping = async (req, res) => {
    try {
        const {purchase} = req.body;

        purchase.products.forEach(async (product) => {
            const dbProduct = await Product.findById(product.idProduct, {stock: true});
            const newStock = dbProduct.stock - product.quantity;
            await Product.findByIdAndUpdate(product.idProduct, {stock: newStock});
        });

        await Purchase.findByIdAndUpdate(purchase._id, { state: 'Completada' });

        res.status(200).send('Compra finalizada :D');
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

// Controladores de las peticiones con envío

shoppingController.requestRemoteOrder = async (req, res) => {
    try {
        const { idbuyer, idseller } = req.headers;
        const { cart } = req.body;
        const images = cart.map((el) => el.principalImage);

        const products = cart.map((el) => {
            return {
                name: el.name,
                quantity: el.quantity,
                price: el.price,
                size: el.sizeSelected,
                idProduct: el._id 
            };
        });

        products.forEach(async (product) => {
            const dbProduct = await Product.findById(product.idProduct, {stock: true});
            if(dbProduct.stock <= 0) return res.status(401).send('Hay un producto agotado.');
            
            await User.findByIdAndUpdate(idbuyer, { '$pull': { 'shoppingCart': product.idProduct } });
        });

        const newPaymentInvoice = new PaymentInvoice({
            seller: idseller, 
            buyer: idbuyer, 
            purchase: products
        });

        const newPurchase = new Purchase({
          state: "Esperando afirmación",
          buyer: idbuyer,
          seller: idseller,
          products,
          invoice: newPaymentInvoice._id,
          images,
          type: 'remote-shipping'
        });
    
        await User.findByIdAndUpdate(
          idbuyer, 
          { '$addToSet': 
            { 'shoppingHistory': newPurchase._id }
          });

        const notification = {
          subject: 'Nuevo pedido de envío!', 
          message: 'Tienes un nuevo pedido, por favor confírmale al usuario si puede seguir con la compra.', 
          redirect: `/duvi/${idseller}/states`
        };

        await Shop.findByIdAndUpdate(idseller, { '$addToSet': { 'notifications': notification}});
        await Shop.findByIdAndUpdate(idseller, { '$addToSet': { 'salesHistory': newPurchase._id}}, {new: true});

        await newPaymentInvoice.save();
        await newPurchase.save();
    
        res.status(200).send('Compra realizada con éxito!');
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

module.exports = shoppingController;