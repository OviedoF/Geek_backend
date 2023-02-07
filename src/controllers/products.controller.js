const path = require('path');
const fs = require('fs-extra');
const Product = require(path.join(__dirname, '..', 'models', 'product.model.js'));
const Category = require(path.join(__dirname, '..', 'models', 'category.model.js'));
const { capitalize } = require(path.join(__dirname, '..', 'libs', 'textHelpers'));
const Shop = require(path.join(__dirname, '..', 'models', 'shop.model'));
const {deleteReqImages} = require(path.join(__dirname, '..', 'libs', 'dirLibrary')); 
require('dotenv').config();

const productsControllers = {};

productsControllers.getProducts = async (req, res) => {
    try {
        const productsFinded = await Product.find().populate(['comments']);

        res.status(200).send(productsFinded);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

productsControllers.getProductsByCategory = async(req, res) => {
    try {
        const { category } = req.params;
        const categoryFinded = await Category.find({name: capitalize(category)});

        if(!categoryFinded) return res.status(404).send("Categoría no encontrada");

        const categoryId = categoryFinded;

        const productsFinded = await Product.find({category: categoryId});
        res.status(200).send(productsFinded);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

productsControllers.getProductById = async(req, res) => {
    try {
        const {id} = req.params;
        const product = await Product.findById(id).populate(['category', 'subcategories', 'comments']);

        // await Product.updateMany({}, {stock: 5});

        if(!product) res.status(404).send("Producto no encontrado");

        res.status(200).send(product);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

productsControllers.filterAndGetProducts = async (req, res) => {
    try{
        const products = await Product.find({}).populate(['shop', 'comments', 'category']);
        console.log(req.body);
        const {stars, categories, prices, shop, noStars} = req.body;
        let productsFiltered = products;
        let filteredByCategories = [];
        let filteredByShop = [];
        let filteredByPrice = [];
        let filteredByStars = [];

        if(stars && stars.length > 0) {

            stars.forEach(star => {
                 const aux = products.filter(product => {
                    let totalStars = 0;
                   
                   product.comments.forEach(comment => totalStars += comment.stars);

                   return (parseInt(totalStars / product.comments.length) === star);
                })
                
                aux.forEach(el => filteredByStars.push(el));
            });

            productsFiltered = filteredByStars.map(productFilteredByStar => {
                for (const product of productsFiltered) {
                    if(product._id === productFilteredByStar._id) return product;
                };
            });

            // console.log('---------FILTRO POR ESTRELLAS---------');
            // filteredByStars.forEach(product => console.log(product._id));
        } // FILTRO POR ESTRELLITAS--------

        if(prices && (prices.maxPrice || prices.minPrice)) {

            if(prices.maxPrice && prices.minPrice) {
                filteredByPrice = products.filter(product => {
                    if(prices.maxPrice && prices.minPrice) return (product.price >= prices.minPrice && product.price <= prices.maxPrice)
                });
            } // Si hay maximo y minimo filtramos los productos con el precio entre ellos.

            if(prices.maxPrice && !prices.minPrice){
                filteredByPrice = products.filter(product => (product.price <= prices.maxPrice));
            } // Si nos pasan máximo pero no mínimo, filtraremos sólo los productos con precio menor al máximo.

            if(prices.minPrice && !prices.maxPrice){
                filteredByPrice = products.filter(product => (product.price >= prices.minPrice));
            } // Si nos pasan mìnimo pero no máxnimo, filtraremos sólo los productos con precio mayor al mínimo.

            productsFiltered = filteredByPrice.map(preoductFilteredByPrice => {
                for (const product of productsFiltered) {
                    if(product._id === preoductFilteredByPrice._id) return product;
                }
            })

            // console.log('---------FILTRO POR PRECIO---------');
            // filteredByPrice.forEach(el => productsFiltered(el));
        } // FILTRO POR PRECIO--------

        if(shop && shop.length > 0) {
            filteredByDuvi = products.filter(product => product.shop.name.toUpperCase() === shop.toUpperCase());
            // Filtramos los productos que en su tienda tenga el mismo nombre que nos pasaron.

            productsFiltered = filteredByDuvi.map(productFilteredByDuvi => {
                for (const product of productsFiltered) {
                    if(product._id === productFilteredByDuvi._id) return product;
                }
            })
        } // FILTRO POR TIENDA ----------------

        if(categories && categories.length > 0){

            categories.forEach(category => {
                aux = products.filter(product => product.category.name.toUpperCase() === category.toUpperCase());
                
                aux.forEach(product => filteredByCategories.push(product) )
            })
            
            productsFiltered = filteredByCategories.map(productFilteredByCategory => {
                for (const product of productsFiltered) {
                    if(product._id === productFilteredByCategory._id) return product;
                }
            });
            // console.log('---------FILTRO POR CATEGORIES---------');
            // filteredByCategories.forEach(el => productsFiltered(el));
        } // FILTRAR OIR CATEGORÍA ------------

        if(noStars){
            productsFiltered = productsFiltered.filter(product => product.comments.length <= 0);
        }

        productsFiltered = productsFiltered.filter(el => el );
        if(productsFiltered.length > 0)  productsFiltered.forEach(el => console.log(el.name));
        return res.status(200).send(productsFiltered);
    }catch(e) {
        console.log(e);
        res.status(500).send(e);
    }
}

productsControllers.createProduct = async (req, res) => {
    try {
        const { filename } = req.files.principalImage[0];
        const galleryImages = req.files.galleryImages;
        const {shopid} = req.headers;
        const galleryImagesUrls = [];

        const shop = await Shop.findById(shopid);
        if(!shop) return res.status(404).send({ message: 'Acceso no concedido, no tiene una tienda asociada.' })

        if(galleryImages) galleryImages.forEach(image => {
            const {filename} = image;
            galleryImagesUrls.push(`${process.env.ROOT_URL}/images/${filename}`);
        })

        const newProduct = await new Product({
            ...req.body,
            principalImage: `${process.env.ROOT_URL}/images/${filename}`,
            galleryImages: galleryImagesUrls,
            shop: shopid
        });

        await newProduct.save();

        const oldShop = await Shop.findById(shopid, {products:true});
        const oldProductsShop = oldShop.products;

        const newProducts = [...oldProductsShop, newProduct._id.toString()];

        await Shop.findByIdAndUpdate(shopid, {
            products: newProducts
        });

        res.status(201).send(newProduct);
    } catch (error) {
        deleteReqImages(req);
        console.log(error);
        return res.status(500).send({
            message: false,
        });
    }
};

productsControllers.updateProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const productFinded = await Product.findById(id)

        if(!productFinded) return res.status(404).send("Producto no encontrado");

        const productUpdated = await Product.findByIdAndUpdate(id, req.body, {new: true});

        res.status(200).send(productUpdated)
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

productsControllers.updatePrincipalImage = async (req, res) => {
    try {
        const {id} = req.params;
        const productFinded = await Product.findById(id)
        const {filename} = req.files[0];

        if(!productFinded) return res.status(404).send("Producto no encontrado");

        const oldImage = productFinded.principalImage.split('/images/')[1];
        const oldImageRoute = path.join(__dirname, '..', 'public', 'images', oldImage);

        deleteImage(oldImageRoute);

        const updatedProduct = await Product.findByIdAndUpdate(id, {
            principalImage: `${process.env.ROOT_URL}/images/${filename}`
        })

        res.status(200).send("Imágen actualizada correctamente.")

    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

productsControllers.removeImage = async (req,res) => {
    try {
        const {id, filename} = req.params;
        const productFinded = await Product.findById(id)

        if(!productFinded) return res.status(404).send("Producto no encontrado");

        const imageRoute = path.join(__dirname, '..', 'public', 'images', filename);

        const newImages = productFinded.galeryImages.filter(el => {
           const filenameElement = el.split('/images/')[1];
           return filenameElement !== filename;
        })

        await Product.findByIdAndUpdate(id, {
            galeryImages: newImages
        });

        deleteImage(imageRoute);

        res.status(200).send("Imágen eliminada correctamente.")
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

productsControllers.pushImage = async (req,res) => {
    try {
        const {id} = req.params;
        const productFinded = await Product.findById(id)
        const {filename} = req.files[0]; 

        if(!productFinded) return res.status(404).send("Producto no encontrado");
        if(productFinded.galeryImages.length > 4) return res.status(400).send("No se pueden ingresar más de 5 imágenes.");

        const newImageUrl = `${process.env.ROOT_URL}/images/${filename}`;
        const newImages = productFinded.galeryImages;

        newImages.push(newImageUrl);

        await Product.findByIdAndUpdate(id, {
            galeryImages: newImages
        });

        res.status(200).send("Imágen agregada correctamente.")
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

productsControllers.deleteProduct = async (req,res) => {
    try {
        const {id} = req.params;
        const productFinded = await Product.findById(id)

        if(!productFinded) return res.status(404).send("No se ha encontrado dicho producto.");

        const primaryImage = productFinded.principalImage.split('/images/')[1];
        const dirPrimaryImage = path.join(__dirname, '..', 'public', 'images', primaryImage);
        deleteImage(dirPrimaryImage);

        const {galeryImages} = productFinded;

        galeryImages.forEach(el => {
            const filename = el.split('/images/')[1];

            const dir = path.join(__dirname, '..', 'public', 'images', filename);
            deleteImage(dir);
        });

        await Product.findByIdAndDelete(id);

        res.status(200).send("Producto eliminado correctamente.");
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

module.exports = productsControllers;