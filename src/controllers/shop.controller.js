const path = require('path');
require('dotenv').config();
const User = require(path.join(__dirname, '..', 'models', 'user.model'));
const Shop = require(path.join(__dirname, '..', 'models', 'shop.model'));
const {deleteReqImages, deleteImage} = require(path.join(__dirname, '..', 'libs', 'dirLibrary'));
const Role = require(path.join(__dirname, '..', 'models', 'role.model'));

const shopController = {};

shopController.getShop = async (req, res) => {
    try {
        const {page} = req.params;
        const startIndex = (page*20) - 20;
        const finishIndex = (page*20) - 1;
        const shops = await Shop.find();
        
        const shopsSliced = shops.slice(startIndex, finishIndex)

        res.status(200).send(shopsSliced);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

shopController.getShopById = async (req, res) => {
    try {
        const {id} = req.params;
        const shop = await Shop.findById(id).populate(['products', 'posts', 'comments']);

        if(!shop) res.status(404).send("Tienda no encontrada.");

        res.status(200).send(shop);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

shopController.createShop = async (req, res) => {
    try {
        const {userid} = req.headers;
        const body = JSON.parse(req.body.form);

        console.log(body);

        const user = await User.findById(userid);

        if(!user) res.status(404).send({
            message: "Usuario no encontrado."
        });

        const newShop = new Shop({
            ...body,
            profileImage: req.files.profileImage ? `${process.env.ROOT_URL}/images/${req.files.profileImage[0].filename}` : `${process.env.ROOT_URL}/default/defaultImage.png`,
            bannerImage: req.files.bannerImage ? `${process.env.ROOT_URL}/images/${req.files.bannerImage[0].filename}` : `${process.env.ROOT_URL}/default/defaultImage.png`,
        })

        const userActualized = await User.findByIdAndUpdate(userid, {
            shop: newShop._id,
        }, {new: true}).populate('shop');

        await newShop.save();

        res.status(201).send(userActualized);
    } catch (error) {
        deleteReqImages(req);
        console.log(error);
        res.status(500).send(error);
    }
};

shopController.updateShop = async (req, res) => {
    try {
        const {id} = req.params;
        const {userid} = req.headers;
        const shop = await Shop.findById(id);
        console.log(req.files);
        const body = JSON.parse(req.body.form);

        if(!shop) res.status(404).send("Tienda no encontrada.");

        if(req.files.profileImage) {
            const oldImage = shop.profileImage.split('/images/')[1];
            const oldImageRoute = path.join(__dirname, '..', 'public', 'images', oldImage);
            deleteImage(oldImageRoute);
            body.profileImage = `${process.env.ROOT_URL}/images/${req.files.profileImage[0].filename}`;
        }

        if(req.files.bannerImage) {
            const oldImage = shop.bannerImage.split('/images/')[1];
            const oldImageRoute = path.join(__dirname, '..', 'public', 'images', oldImage);
            deleteImage(oldImageRoute);
            body.bannerImage = `${process.env.ROOT_URL}/images/${req.files.bannerImage[0].filename}`;
        }

        const updatedshop = await Shop.findByIdAndUpdate(id, body, {new: true});

        const user = await User.findById(userid).deepPopulate([ 'shop.products' ,'shoppingHistory']);;
        const rolesExist = await Role.find({_id: {$in: user.roles}}, {name: true});

        const userRoles = rolesExist.map(el => el.name);

        const userToSend = {
            ...user._doc,
            roles: userRoles
        }
        

        res.status(200).send(userToSend);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

shopController.getNotifications = async (req, res) => {
    try {
        const {id} = req.params;
        console.log(id);
        const shop = await Shop.findById(id, {notifications: true});
        console.log(shop);
        return res.status(200).send(shop.notifications)
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}

module.exports = shopController;