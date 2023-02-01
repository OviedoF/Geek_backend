const path = require('path');
const Shop = require(path.join(__dirname, '..', 'models', 'shop.model'));
const {deleteReqImages} = require(path.join(__dirname, '..', 'libs', 'dirLibrary'));
const checkDuplicate = {};

checkDuplicate.checkDuplicateShop = (check, message) => {
    return async (req, res, next) => {
        const isDuplicate = await Shop.findOne({
            [check]: JSON.parse(req.body.form)[check]
        });
    
        if(isDuplicate) {
            console.log('isDuplicate', JSON.parse(req.body.form)[check]);
            deleteReqImages(req);
            return res.status(400).json({
                message,
                duplicate: check
            })
        };
    
        next();
    };
};

module.exports = checkDuplicate;