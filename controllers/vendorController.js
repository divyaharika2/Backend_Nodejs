const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotEnv = require('dotenv');

dotEnv.config();

const secretKey = process.env.JWT_SECRET || "fallbackSecret";

const vendorRegister = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    console.log("Register request received:", req.body);

    const vendorEmail = await Vendor.findOne({ email });
    if (vendorEmail) {
      return res.status(400).json({ error: "Email already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newVendor = new Vendor({ username, email, password: hashedPassword });

    await newVendor.save();
    console.log("Vendor registered:", email);

    res.status(201).json({ message: "Vendor registered successfully" });
  } catch (error) {
    console.error("VendorRegister error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const vendorLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const vendor = await Vendor.findOne({ email });
    if (!vendor || !(await bcrypt.compare(password, vendor.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ vendorId: vendor._id }, secretKey, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
      vendorId: vendor._id
    });

    console.log("Login successful for:", email);
  } catch (error) {
    console.error("VendorLogin error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('firm');
    res.status(200).json({ vendors });
  } catch (error) {
    console.error("GetAllVendors error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getVendorById = async (req, res) => {
  const vendorId = req.params.vendorId;
  try {
    const vendor = await Vendor.findById(vendorId).populate('firm');
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    if (Array.isArray(vendor.firm) && vendor.firm.length > 0) {
      const vendorFirmId = vendor.firm[0]._id;
      res.status(200).json({ vendorId, vendorFirmId, vendor });
    } else if (vendor.firm) {
      res.status(200).json({ vendorId, vendorFirmId: vendor.firm._id, vendor });
    } else {
      res.status(404).json({ error: "Firm not found for vendor" });
    }
  } catch (error) {
    console.error("GetVendorById error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { vendorRegister, vendorLogin, getAllVendors, getVendorById };