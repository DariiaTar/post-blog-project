// controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) return res.status(400).json({ message: 'Please add all fields' });
    const userExists = await User.findOne({ name });
    if (userExists) return res.status(400).json({ message: 'User with this name already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, password: hashedPassword });
    
    if (user) {
        res.status(201).json({ _id: user.id, name: user.name, token: generateToken(user._id) });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

const loginUser = async (req, res) => {
    const { name, password } = req.body;
    const user = await User.findOne({ name });
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({ _id: user.id, name: user.name, token: generateToken(user._id) });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

module.exports = { registerUser, loginUser };