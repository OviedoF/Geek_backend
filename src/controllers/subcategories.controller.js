const path = require('path');
const fs = require('fs-extra');
const Subcategory = require(path.join(__dirname, '..', 'models', 'subcategory.model.js'));
const Category = require(path.join(__dirname, '..', 'models', 'category.model.js'));
require('dotenv').config();
const {deleteImage, deleteReqImages} = require(path.join(__dirname, '..', 'libs', 'dirLibrary')); 

const subCategoriesControllers = {};

subCategoriesControllers.getSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.find({}).populate('category');
        res.status(200).send(subcategories);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
};

subCategoriesControllers.getSubcategoryById = async (req, res) => {
    try {
        const {id} = req.params;
        const subcategorie = await Subcategory.findById(id).populate('category');

        if(!subcategorie) {
            return res.status(404).send('Subcategoría no encontrada.');
        }

        res.status(200).send(subcategorie);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
};

subCategoriesControllers.getSubcategoryByFather = async (req, res) => {
    try {
        const {category} = req.params;
        const categoriesFinded = await Subcategory.find({category}).populate('category');

        res.status(200).send(categoriesFinded);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
};

subCategoriesControllers.createSubCategory = async (req, res) => {
    try {
        const {filename} = req.files.images[0];
        const {category} = req.body;
        const imageUrl = `${process.env.ROOT_URL}/images/${filename}`;

        const newSubCategory = new Subcategory({
            ...req.body,
            imageUrl
        })

        const subCategorySaved = await newSubCategory.save();

        const fatherCategory = await Category.findById(category);

        const actualizedFather = await Category.findByIdAndUpdate(category, {
            subCategories: [...fatherCategory.subCategories, subCategorySaved._id]
        });

        res.status(201).send({
            message: 'Subcategoría creada con éxito!',
            subCategory: subCategorySaved,
            father: actualizedFather
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
};

subCategoriesControllers.updateSubCategory = async (req, res) => {
    try {
        const {id} = req.params;
        const {category} = req.body;
        const oldCategory = await Subcategory.findById(id);
        const idOldCategory = oldCategory.category.toString();

        if(req.files && req.files.images){
            const subCategoryFinded = await Subcategory.findById(id);
            const oldImageName = subCategoryFinded.imageUrl.split('/images/')[1];
            const routeImagesFolder = path.join(__dirname, '..', 'public', 'images', oldImageName);
            deleteImage(routeImagesFolder);

            const {filename} = req.files.images[0];
            await Subcategory.findByIdAndUpdate(id, { imageUrl: `${process.env.ROOT_URL}/images/${filename}` })
        };

        if(category){
            const oldCategoryFinded = await Category.findById(idOldCategory);
            const newChildrens = oldCategoryFinded.subCategories.filter(el => {
                const toString = el.toString();
                return toString !== id;
            });
            await Category.findByIdAndUpdate(idOldCategory, {
                subCategories: newChildrens
            });


            const categoryFinded = await Category.findById(category);
            await Category.findByIdAndUpdate(category, { 
                subCategories: [...categoryFinded.subCategories, id]
             })
        };

        const actualizedItem = await Subcategory.findByIdAndUpdate(id, req.body, {new: true}).populate('category');

        res.status(200).send(actualizedItem);
    } catch (error) {
        deleteReqImages(req)
        console.log(error);
        return res.status(500).send(error);
    }
};

subCategoriesControllers.deleteSubCategory = async (req, res) => {
    try {
        const {id} = req.params;

        const oldItem = await Subcategory.findById(id);
        const oldImageName = oldItem.imageUrl.split('/images/')[1];
        const routeImagesFolder = path.join(__dirname, '..', 'public', 'images', oldImageName);
        deleteImage(routeImagesFolder);

        const idOldCategory = oldItem.category.toString();

        const oldCategoryFinded = await Category.findById(idOldCategory);
        const newChildrens = oldCategoryFinded.subCategories.filter(el => {
            const toString = el.toString();
            return toString !== id;
        });
        await Category.findByIdAndUpdate(idOldCategory, {
            subCategories: newChildrens
        });

        const deletedItem = await Subcategory.findByIdAndDelete(id);
        res.status(200).send(deletedItem);
        
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}
module.exports = subCategoriesControllers;