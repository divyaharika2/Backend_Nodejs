const Product = require('../models/Product');
const Firm = require('../models/Firm');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose')
const { ConnectionStates } = require('mongoose');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save in uploads folder
    },
    filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});
const upload = multer({storage: storage});


const addProduct = async(req, res)=> {
    try {
        const{ productName, price, category, bestSeller, description} = req.body;
        const image = req.file? req.file.filename : undefined;

        const firmId = req.params.firmId;
        console.log('firmId:', firmId);

        const firm = await Firm.findById(firmId);

        if(!firm){
            return res.status(404).json({error:"No firm found"});
        }
        const product  = new Product({
            productName, 
            price, 
            category, 
            bestSeller, 
            description, 
            image, 
            firm : firm._id
        });

        const savedProduct = await product.save();
        firm.products.push(savedProduct);
        await firm.save();
        res.status(200).json(savedProduct)

    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Internal server error"});
        
    }
}

const getProductByFirm = async(req,res) =>{
    try {
        const firmId =req.params.firmId;
        const firm = await Firm.findById(firmId);
        if(!firm){
            return res.status(404).json({error:"No firm found"});
        }
        const restaurantName = firm.firmName;
        const products = await Product.find({firm: firmId});

        res.status(200).json({restaurantName, products});

    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Internal server error"});
        
    }
}
const deleteProductById = async(req, res) =>{
    try {
        const productId = req.params.productId;
        const deleteProduct = await Product.findByIdAndDelete(productId);

        if(!deleteProduct){
            return res.status(404).json({error:"No Product Found"});
        }
        await Firm.updateOne(
         { _id: deleteProduct.firm },
         { $pull: { products: productId } }
         );

    res.status(200).json({ message: "Product deleted successfully" });
         res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Internal server error"});
        
    }
}


module.exports = {addProduct:[upload.single('image'), addProduct], getProductByFirm, deleteProductById};