const path = require('path');
const fs = require('fs');
const Purchase = require(path.join(__dirname, '..', 'models', 'purchase.model'));
const User = require(path.join(__dirname, '..', 'models', 'user.model'));
const Shop = require(path.join(__dirname, '..', 'models', 'shop.model'));
const Product = require(path.join(__dirname, '..', 'models', 'product.model'));
const Proposal = require(path.join(__dirname, '..', 'models', 'proposal.model'));
const nodemailer = require('nodemailer');
require('dotenv').config();
const jwt = require('jsonwebtoken');

purchaseController = {};

// Create and Save a new Purchase

purchaseController.getPurchasesOfBuyer = async (req, res) => {
    try {
        const {id} = req.params;

        const purchases = await Purchase.find({buyer: id});

        res.status(200).send(purchases);
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Error al obtener las compras', error});
    }
}

purchaseController.create = async (req, res) => {
    try {
        const {proposal, product} = req.body;

        const proposalFinded = await Proposal.findById(proposal).populate('user');
        const productFinded = await Product.findById(product).populate('shop');

        if(!proposalFinded || !productFinded) return res.status(404).json({message: 'Propuesta o producto no encontrados'});

        const body = {
            state: 'pending',
            buyer: proposalFinded.user._id,
            seller: productFinded.shop._id,
            product: productFinded._id,
            rupies: proposalFinded.amount ? true : false,
            amount: proposalFinded.amount,
            trade: proposalFinded.images && proposalFinded.images[0] ? true : false,
            shippingSeller: {
                state: 'pending',
                city: productFinded.city,
                address: productFinded.address,
                code: productFinded.code,
            }
        }

        if(proposalFinded.images && proposalFinded.images[0]) {
            body.shippingBuyer = {
                state: 'pending',
                city: proposalFinded.city,
                address: proposalFinded.address,
                code: proposalFinded.code,
            }
        }

        const purchase = new Purchase(body);

        await purchase.save();

        await Product.findByIdAndUpdate(productFinded._id, {inProcess: true});

        const transporter = await nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const messageHtml = `    
        <div styles="border-radius: 20px;">
            <h1 style="padding: 10px; text-align: center; font-weight: 200;">¡Propuesta aceptada!</h1>

            <div style="padding: 10px; text-align: center; font-weight: 200;">
                <p>¡El vendedor ha aceptado tu propuesta!</p>

                <p>Para continuar con el proceso de compra, por favor, confirma tu compra en la aplicación.</p>

                <a href="${process.env.FRONTEND_URL}#/confirm/${purchase._id}" style="text-decoration: none; color: #fff; background-color: #000; padding: 10px; border-radius: 10px;">Ir a la aplicación</a>

                <p>¡Gracias por usar Geek4Dummies!</p>
            </div>
        </div>` 

        const emailSended = await transporter.sendMail({
            from: `'Geek4Dummies APP' <${process.env.MAIL_USERNAME}>`,
            to: proposalFinded.user.email,
            subject: 'Geek4Dummies APP - PETICIÓN ACEPTADA',
            html: messageHtml
        })
        console.log(purchase)

        res.status(201).send({message: '¡Compra confirmada!', purchase});
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Error al crear la compra', error});
    }
};

purchaseController.getPurchase = async (req, res) => {
    try {
        const {id} = req.params;

        const purchase = await Purchase.findById(id).populate(['buyer', 'seller', 'product']);

        if(!purchase) return res.status(404).json({message: 'Compra no encontrada'});

        res.status(200).send({purchase});
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Error al obtener la compra', error});
    }
}

purchaseController.confirmPurchase = async (req, res) => {
    try {
        const {id} = req.params;

        const purchase = await Purchase.findById(id).populate(['buyer', 'seller', 'product']);

        if(!purchase) return res.status(404).json({message: 'Compra no encontrada'});

        if(purchase.state !== 'pending') return res.status(400).json({message: 'La compra ya ha sido confirmada'});

        const transporter = await nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        if(purchase.rupies) {
            await Purchase.findByIdAndUpdate(id, {state: 'inDebt'});

            const messageHtml = `
            <div styles="border-radius: 20px;">
                <h1 style="padding: 10px; text-align: center; font-weight: 200;">¡Compra confirmada!</h1>

                <div style="padding: 10px; text-align: center; font-weight: 200;">
                    <p>¡El intercambio ha sido confirmado!</p>

                    <p>Por favor, realiza el pago de ${purchase.amount} rupias a la cuenta del vendedor.</p>

                    <p>Una vez realizado el pago, por favor, confirma el pago en la aplicación.</p>

                    <a href="${process.env.FRONTEND_URL}#/payment-purchase/${purchase._id}" style="text-decoration: none; color: #fff; background-color: #000; padding: 10px; border-radius: 10px;">Ir a la aplicación</a>

                    <p>¡Gracias por usar Geek4Dummies!</p>
                </div>
            </div>`

            const emailSended = await transporter.sendMail({
                from: `'Geek4Dummies APP' <${process.env.MAIL_USERNAME}>`,
                to: purchase.buyer.email,
                subject: 'Geek4Dummies APP - INTERCAMBIO CONFIRMADO',
                html: messageHtml
            })

            const messageHtmlSeller = `
            <div styles="border-radius: 20px;">
                <h1 style="padding: 10px; text-align: center; font-weight: 200;">¡Intercambio confirmado!</h1>

                <div style="padding: 10px; text-align: center; font-weight: 200;">
                    <p>¡${purchase.buyer.name} ha confirmado el intercambio!</p>

                    <p>Por favor, espera a que el comprador realice el pago de las rupias necesarias.</p>

                    <p>Una vez que lo haga, le envíaremos un correo electrónico para empezar el proceso de envío.</p>

                    <p>¡Gracias por usar Geek4Dummies!</p>
                </div>
            </div>`

            const emailSendedSeller = await transporter.sendMail({
                from: `'Geek4Dummies APP' <${process.env.MAIL_USERNAME}>`,
                to: purchase.seller.email,
                subject: 'Geek4Dummies APP - INTERCAMBIO CONFIRMADO',
                html: messageHtmlSeller
            })

            return res.status(200).send({message: '¡Compra confirmada!', purchase});
        } 

        if(purchase.trade) {
            await Purchase.findByIdAndUpdate(id, {state: 'inTrade', shippingBuyer: {state: 'pending'}, shippingSeller: {state: 'pending'}});

            const messageHtml = `
            <div styles="border-radius: 20px;">
                <h1 style="padding: 10px; text-align: center; font-weight: 200;">¡Compra confirmada!</h1>

                <div style="padding: 10px; text-align: center; font-weight: 200;">
                    <p>¡La compra ha sido confirmada!</p>

                    <p>El proceso de envíos de productos ha inicializado.</p>

                    <p>Una vez realizado el envío, por favor, actualiza el envío en la aplicación para que el par reciba la notificación.</p>

                    <a href="${process.env.FRONTEND_URL}#/shipping/${purchase._id}" style="text-decoration: none; color: #fff; background-color: #000; padding: 10px; border-radius: 10px;">Ir a la aplicación</a>

                    <p>¡Gracias por usar Geek4Dummies!</p>
                </div>
            </div>`

            await transporter.sendMail({
                from: `'Geek4Dummies APP' <${process.env.MAIL_USERNAME}>`,
                to: purchase.buyer.email,
                subject: 'Geek4Dummies APP - PROCESO DE ENVÍO INICIADO',
                html: messageHtml
            })

            await transporter.sendMail({
                from: `'Geek4Dummies APP' <${process.env.MAIL_USERNAME}>`,
                to: purchase.seller.email,
                subject: 'Geek4Dummies APP - PROCESO DE ENVÍO INICIADO',
                html: messageHtml
            })

            return res.status(200).send({message: '¡Compra confirmada!', purchase});
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Error al confirmar la compra', error});
    }
}

purchaseController.payAmount = async (req, res) => {
    try {
        const {idPurchase, idUser} = req.params;

        const buyerExists = await User.findById(idUser);
        const purchaseExists = await Purchase.findById(idPurchase);
        const amountToPay = purchaseExists.amount;
        const sellerExists = await Shop.findById(purchaseExists.seller);
        const sellerUser = await User.findOne({shop: sellerExists._id});

        if(!buyerExists) return res.status(404).json({message: 'No se ha mandado un usuario.'});
        if(!purchaseExists) return res.status(404).json({message: 'No existe tal compra.'});
        if(!sellerUser) return res.status(404).json({message: 'No existe tal vendedor.'});
        if(buyerExists.wallet.balance < amountToPay) return res.status(400).json({message: 'No tienes las suficientes rupias para realizar la compra, vaya al panel y cargue las necesarias 😁.'});
        if(buyerExists._id.toString() !== purchaseExists.buyer.toString()) return res.status(400).json({message: 'No tiene los permisos para realizar esta acción, pruebe ingresar de nuevo.'});
        if(purchaseExists.state !== 'inDebt') return res.status(400).json({message: 'La compra no está en deuda.'});

        await User.findByIdAndUpdate(buyerExists._id, {
            $inc: { "wallet.balance": -amountToPay },
        });

        await User.findByIdAndUpdate(sellerUser._id, {
            $inc: { "wallet.pending": amountToPay },
        });

        const transporter = await nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const messageHtml = ` <div styles="border-radius: 20px;">
            <h1 style="padding: 10px; text-align: center; font-weight: 200;">¡Pago realizado!</h1>

            <div style="padding: 10px; text-align: center; font-weight: 200;">
                <p>¡${buyerExists.name} ha realizado el pago de la compra!</p>

                <p>Por favor, espera a que el vendedor realice el envío de los productos. No se preocupe, lo mantendremos informado!</p>

                <p>¡Gracias por usar Geek4Dummies!</p>

                <a href="${process.env.FRONTEND_URL}#/shipping/${purchaseExists._id}" style="text-decoration: none; color: #fff; background-color: #000; padding: 10px; border-radius: 10px;">Ir a la aplicación</a>
            </div>
        </div>`

        const messageHtmlIfSellerHasProductToTrade = ` <div styles="border-radius: 20px;">
            <h1 style="padding: 10px; text-align: center; font-weight: 200;">¡Pago realizado!</h1>

            <div style="padding: 10px; text-align: center; font-weight: 200;">
                <p>¡${buyerExists.name} ha realizado el pago de la compra!</p>

                <p>Como has ofrecido un producto en tu oferta, al vendedor y a ti se les ha inicializado el proceso de envío de sus productos. No se preocupen! los mantendremos informados</p>

                <p>¡Gracias por usar Geek4Dummies!</p>

                <a href="${process.env.FRONTEND_URL}#/shipping/${purchaseExists._id}" style="text-decoration: none; color: #fff; background-color: #000; padding: 10px; border-radius: 10px;">Ir a la aplicación</a>
            </div>
        </div>`

        await transporter.sendMail({
            from: `'Geek4Dummies APP' <${process.env.MAIL_USERNAME}>`,
            to: buyerExists.email,
            subject: 'Geek4Dummies APP - PAGO REALIZADO',
            html: purchaseExists.trade ? messageHtmlIfSellerHasProductToTrade : messageHtml
        }) // Enviar correo al comprador avisando que el pago se ha realizado correctamente

        const messageToSeller = ` <div styles="border-radius: 20px;">
            <h1 style="padding: 10px; text-align: center; font-weight: 200;">¡Pago realizado!</h1>

            <div style="padding: 10px; text-align: center; font-weight: 200;">
                <p>¡${buyerExists.name} ha realizado el pago de la compra!</p>

                <p>Por favor, realiza el envío de los productos. No se preocupe, lo mantendremos informado!</p>

                <p>¡Gracias por usar Geek4Dummies!</p>

                <a href="${process.env.FRONTEND_URL}#/shipping/${purchaseExists._id}" style="text-decoration: none; color: #fff; background-color: #000; padding: 10px; border-radius: 10px;">Ir a la aplicación</a>
            </div>
        </div>`

        const messageToSellerIfHasProductToTrade = ` <div styles="border-radius: 20px;">
            <h1 style="padding: 10px; text-align: center; font-weight: 200;">¡Pago realizado!</h1>

            <div style="padding: 10px; text-align: center; font-weight: 200;">  

                <p>¡${buyerExists.name} ha realizado el pago de la compra!</p>

                <p>Como han ofrecido un producto en la oferta, al comprador y a ti se les ha inicializado el proceso de envío de sus productos. No se preocupen! los mantendremos informados</p>

                <p>¡Gracias por usar Geek4Dummies!</p>

                <a href="${process.env.FRONTEND_URL}#/shipping/${purchaseExists._id}" style="text-decoration: none; color: #fff; background-color: #000; padding: 10px; border-radius: 10px;">Ir a la aplicación</a>
            </div>
        </div>`

        const emailSendedToSeller = await transporter.sendMail({
            from: `'Geek4Dummies APP' <${process.env.MAIL_USERNAME}>`,
            to: sellerExists.email,
            subject: 'Geek4Dummies APP - PAGO REALIZADO',
            html: purchaseExists.trade ? messageToSellerIfHasProductToTrade : messageToSeller
        }) // Enviar correo al vendedor avisando que el pago se ha realizado y envíe el producto

        if(purchaseExists.trade) {
            await Purchase.findByIdAndUpdate(purchaseExists._id, {state: 'paid', shippingSeller: {
                state: 'pending',
            }, shippingBuyer:{
                state: 'pending'
            }});
        } else {
            await Purchase.findByIdAndUpdate(purchaseExists._id, {state: 'paid', shippingSeller: {
                state: 'pending',
            }});
        }

        return res.status(200).send({message: '¡Pago realizado!', emailSendedToSeller});
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Error al realizar el pago', error});
    }
}

module.exports = purchaseController;