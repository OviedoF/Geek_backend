require("dotenv").config();
const path = require("path");
const axios = require("axios");
const User = require(path.join(__dirname, "..", "models", "user.model"));
const Shop = require(path.join(__dirname, "..", "models", "shop.model"));
const Product = require(path.join( __dirname, "..", "models", "product.model.js"));
const Purchase = require(path.join( __dirname, "..", "models", "purchase.model.js" ));
const PaymentInvoice = require(path.join( __dirname, "..", "models", "paymentInvoice.model.js" ));

const PaymentsController = {};

PaymentsController.getPaymentLink = async (req, res) => {
  try {
    const url = "https://api.mercadopago.com/checkout/preferences";
    const { cart } = req.body;

    const items = cart.map((el) => {
      return {
        id: el._id,
        title: el.name,
        description: el.description,
        quantity: el.quantity,
        unit_price: el.price,
        category_id: el.category,
        picture_url: el.principalImage,
      };
    });

    const body = {
      payer_email: "test_user_49360370@testuser.com",
      payer: {
        id: "test_user_49360370",
        email: "test_user_49360370@testuser.com",
        name: "Test User",
      },
      items,
      back_urls: {
        failure: "/failure",
        pending: "/pending",
        success: "/success",
      },
      auto_return: "approved",
      statement_descriptor: "Shop", //Descripcion en Resumen de Tarjeta
      notificacion_url: `https://${process.env.ROOT_URL}/api/payments/notifications`,
      additional_info: "COMPRA",
    };

    const payment = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    return res.status(201).send(payment.data);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

PaymentsController.paymentSuccess = async (req, res) => {
  /* 
    - Notificar al vendedor (websockets)
    - Crear nuevo documento de compra con estado "in process" #
    - Crear nuevo documento "paymentInvoice" con la información a renderizar en el front #
    - Agregar nueva propiedad "paymentInvoice" con el documento nuevo (ref) #
    - Agregar al historial y seguimiento de vendedor y comprador #
    - Agregar monto a wallet vendedor #
    - Generar factura (en html) y guardar su enlace en el documento de la compra #
    - Crear "seguimientos" en el documento del usuario y añadir la compra (ref) # 
    - Mandar por email la confirmación y la factura 
    - Quitar producto del carrito del comprador #
    - Quitar cantidad de stock al producto #
  */
  try {
    const { idbuyer, idseller } = req.headers;
    const { cart, totalPrice } = req.body;
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

      if(dbProduct.stock <= 0) return res.status(401).send('Producto agotado.');

      const newStock = dbProduct.stock - product.quantity;

      await Product.findByIdAndUpdate(product.idProduct, {stock: newStock});
      await User.findByIdAndUpdate(idbuyer, { '$pull': { 'shoppingCart': product.idProduct } });
    });

    const newPaymentInvoice = new PaymentInvoice({seller: idseller, buyer: idbuyer, purchase: products});

    const newPurchase = new Purchase({
      state: "in process",
      buyer: idbuyer,
      seller: idseller,
      products,
      images,
      invoice: newPaymentInvoice._id,
      PaymentInvoice: newPaymentInvoice._id
    });

    await User.findByIdAndUpdate(idbuyer, { 
      '$addToSet': { 'shoppingHistory': newPurchase._id }},
    {new: true});

    await Shop.findByIdAndUpdate(idseller, { '$addToSet': { 'salesHistory': newPurchase._id } }, {new: true});

    await newPaymentInvoice.save();
    await newPurchase.save();

    const oldSeller = await User.findOne({shop: idseller}, {wallet: true});
    await User.updateOne({shop: idseller}, { 
      wallet: { 
          onProperty: oldSeller.wallet.onProperty,
          onWait: oldSeller.wallet.onWait + totalPrice
      }
    });

    res.status(200).send('Compra realizada con éxito');
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};

PaymentsController.getPaymentInvoice = async (req, res) => {
  try {
    const invoice = await PaymentInvoice.findById(req.params.id).populate(['buyer', 'seller']);
    return res.status(200).send(invoice);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}

module.exports = PaymentsController;
