const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotEnv = require('dotenv');


dotEnv.config();  

const secretKey = process.env.WhatIsYourName



const vendorRegister = async(req, res) =>{
    const {username, email, password} =req.body
    try{
        const vendorEmail = await Vendor.findOne({email});
        if (vendorEmail){
            return res.status(400).json({error:"Email already taken"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newVendor = new Vendor({
            username,
            email,
            password: hashedPassword
        });
        await newVendor.save();
        res.status(201).json({message:"vendor registered Successfully"});
        console.log('vendor registered')
    }catch(error){
        console.error(error)
        res.status(500).json({error:"Internal server error"});

    }
};



const vendorLogin = async(req,res) => {
    const{email, password} = req.body;

    try{
        const vendor = await Vendor.findOne({email});

       if(!vendor || !(await bcrypt.compare(password,vendor.password))){
            return res.status(401).json({error: "Invalid username or password"});
        }
        const token = jwt.sign({vendorId: vendor._id}, secretKey, {expiresIn:"1hr"});

        const vendorId = vendor._id;
        
        res.status(200).json({success:"Login successful" ,token, vendorId})
        console.log(email, "this is token",token);
    } catch(error){
        console.error(error);
        res.status(500).json({error: "Internal server error"});
    }
};

const getAllVendors = async(req, res)=> {
    try {
        const vendors = await Vendor.find().populate('firm');
        res.status(200).json({vendors});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"internal server error"});
    }
}

const getVendorById = async(req,res) =>{
    const vendorId = req.params.vendorId;
    try {
        const vendor = await Vendor.findById(vendorId).populate('firm');
        if(!vendor){
            return res.status(404).json({error:"Vendor not found"});
        }
        if (vendor.firm?.length > 0) {
    const vendorFirmId = vendor.firm[0]._id;
    res.status(200).json({ vendorId, vendorFirmId, vendor });
    console.log(vendorFirmId);
} else {
    res.status(404).json({ error: "Firm not found for vendor" });
}
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"internal server error"});
        
    }
}

module.exports = {vendorRegister, vendorLogin, getAllVendors, getVendorById};

