require("dotenv").config();
const path = require("path");
const Purchase = require(path.join( __dirname, "..", "models", "purchase.model.js" ));
const historyController = {};

historyController.getUserHistory = async (req, res) =>{
    try {
        const {id} = req.params;

        const history = await Purchase.find({ buyer: id }).populate(['seller']);

        res.status(200).send(history); 
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error
        });
    }
}

historyController.getShopHistory = async (req, res) =>{
    try {
        const {id} = req.params;

        const history = await Purchase.find({ seller: id }).populate('buyer');

        res.status(200).send(history); 
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error
        });
    }
}

module.exports = historyController;