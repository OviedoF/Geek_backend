const path = require('path');
const fs = require('fs');
const Proposal = require(path.join(__dirname, '..', 'models', 'proposal.model'));
const User = require(path.join(__dirname, '..', 'models', 'user.model'));
const Product = require(path.join(__dirname, '..', 'models', 'product.model'));
const {deleteImage, deleteReqImages} = require(path.join(__dirname, '..', 'libs', 'dirLibrary'));
const proposalController = {};
require('dotenv').config();

proposalController.getProposals = async (req, res) => {
    try {
        const proposals = await Proposal.find().populate('user');
        res.status(200).json(proposals);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las propuestas.'});
    }
};

proposalController.getProposal = async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id).populate('user');
        res.status(200).json(proposal);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener la propuesta.'});
    }
}

proposalController.createProposal = async (req, res) => {
    try {
        const body = req.body;
        const images = [];

        if (req.files.images) {
            req.files.images.forEach(file => {
                const {filename} = file;
                images.push(`${process.env.ROOT_URL}/images/${filename}`);
            });
        }

        body.images = images;
        body.status = 'Pending';

        const proposal = new Proposal(body);

        await Product.findByIdAndUpdate(body.product, {$push: {proposals: proposal._id}});

        await proposal.save();
        res.status(200).json({message: 'Propuesta creada correctamente.'});
    } catch (error) {
        deleteReqImages(req);
        console.log(error)
        res.status(500).json({message: 'Error al crear la propuesta.'});
    }
}

proposalController.updateProposal = async (req, res) => {
    try {
        const {title, description, amount, status} = req.body;
        const proposal = await Proposal.findById(req.params.id);

        if (req.files[0]) {
            req.files.forEach(file => {
                proposal.images.push(file.filename);
            });
        }

        proposal.title = title;
        proposal.description = description;
        proposal.amount = amount;
        proposal.status = status;

        await proposal.save();
        res.status(200).json({message: 'Propuesta actualizada correctamente.'});
    } catch (error) {
        if(req.files[0]) {
            req.files.forEach(file => {
                deleteImage(path.join(__dirname, '..', 'public', 'uploads', file.filename));
            });
        }
        res.status(500).json({message: 'Error al actualizar la propuesta.'});
    }
}

proposalController.deleteProposal = async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);

        if (proposal.images[0]) {
            proposal.images.forEach(image => {
                deleteImage(path.join(__dirname, '..', 'public', 'uploads', image));
            });
        }

        await Proposal.findByIdAndDelete(req.params.id);
        res.status(200).json({message: 'Propuesta eliminada correctamente.'});
    } catch (error) {
        res.status(500).json({message: 'Error al eliminar la propuesta.'});
    }
}

proposalController.deleteImageProposal = async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        const image = proposal.images[req.params.index];

        deleteImage(path.join(__dirname, '..', 'public', 'uploads', image));
        proposal.images.splice(req.params.index, 1);
        await proposal.save();

        res.status(200).json({message: 'Imágen eliminada correctamente.'});
    } catch (error) {
        res.status(500).json({message: 'Error al eliminar la imágen.'});
    }
}

proposalController.getProposalsByUser = async (req, res) => {
    try {
        const proposals = await Proposal.find({user: req.params.id}).populate('user');
        res.status(200).json(proposals);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las propuestas.'});
    }
}

proposalController.getProposalsByProduct = async (req, res) => {
    try {
        const proposals = await Proposal.find({product: req.params.id}).populate('user');
        res.status(200).json(proposals);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las propuestas.'});
    }
}

proposalController.getProposalsByStatus = async (req, res) => {
    try {
        const proposals = await Proposal.find({status: req.params.status}).populate('user');
        res.status(200).json(proposals);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las propuestas.'});
    }
}

proposalController.getProposalsByUserAndStatus = async (req, res) => {
    try {
        const proposals = await Proposal.find({user: req.params.id, status: req.params.status}).populate('user');
        res.status(200).json(proposals);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las propuestas.'});
    }
}

proposalController.getProposalsByProductAndStatus = async (req, res) => {
    try {
        const proposals = await Proposal.find({product: req.params.id, status: req.params.status}).populate('user');
        res.status(200).json(proposals);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las propuestas.'});
    }
}

proposalController.getProposalsByUserAndProduct = async (req, res) => {
    try {
        const proposals = await Proposal.find({user: req.params.id, product: req.params.product}).populate('user');
        res.status(200).json(proposals);
    } catch (error) {
        res.status(500).json({message: 'Error al obtener las propuestas.'});
    }
}

module.exports = proposalController;
