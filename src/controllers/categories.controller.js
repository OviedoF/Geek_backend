const path = require('path');
const fs = require('fs-extra');
const Category = require(path.join(__dirname, '..', 'models', 'category.model.js'));
const Subcategory = require(path.join(__dirname, '..', 'models', 'subcategory.model.js'));
const deleteImage = require(path.join(__dirname, '..', 'libs', 'dirLibrary'));
const { capitalize } = require(path.join(__dirname, '..', 'libs', 'textHelpers'));
require('dotenv').config();

const categoriesControllers = {};

categoriesControllers.getCategories = async (req, res) => {
    try {
        const categoriesFinded = await Category.find().populate('subCategories');
        res.status(200).send(categoriesFinded);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

categoriesControllers.getCategoryById = async (req, res) => {
    try {
        const {id} = req.params;
        const categoryFinded = await Category.findById(id).populate('subCategories');

        if(!categoryFinded) return res.status(404).send('No se ha encontrado la categoría.')

        res.status(200).send(categoryFinded);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

categoriesControllers.createCategory = async (req, res) => {
    try {
        const {filename} = req.files[0];
        const {name} = req.body;
        const imageUrl = `${process.env.ROOT_URL}/images/${filename}`;

        const newCategory = new Category({
            name: capitalize(name),
            imageUrl
        })

        const categorySaved = await newCategory.save();

        res.status(201).send({
            message: 'Categoría creada con éxito!',
            category: categorySaved
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
};

categoriesControllers.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const CategoryFinded = await Category.findById(id);

        if(!CategoryFinded) {
            return res.status(404).send('No se ha encontrado la categoría.');
        };

        if(req.files[0]) {
            const oldImageName = CategoryFinded.imageUrl.split('/images/')[1];
            const routeImagesFolder = path.join(__dirname, '..', 'public', 'images', oldImageName);
            deleteImage(routeImagesFolder);

            const {filename} = req.files[0];
            await Category.findByIdAndUpdate(id, { imageUrl: `${process.env.ROOT_URL}/images/${filename}` });
        };

        const categoryActualized = await Category.findByIdAndUpdate(id, req.body, {new: true}).populate('subCategories');

        res.status(200).send(categoryActualized);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

categoriesControllers.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const CategoryFinded = await Category.findById(id);

        if(!CategoryFinded) return res.status(404).send('No se ha encontrado la categoría.');

        for (const idChild of CategoryFinded.subCategories) {
            const idToString = idChild.toString();  
            const subcategory = await Subcategory.findById(idToString);

            if(!subcategory) continue;
            
            await Subcategory.findByIdAndDelete(idToString);
        }

        const oldImageName = CategoryFinded.imageUrl.split('/images/')[1];
        const routeImagesFolder = path.join(__dirname, '..', 'public', 'images', oldImageName);
        deleteImage(routeImagesFolder);

        const deletedItem = await Category.findByIdAndDelete(id);

        res.status(200).send(deletedItem);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

module.exports = categoriesControllers;