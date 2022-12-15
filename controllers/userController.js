const UserSchema = require('../models/userModel');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  register: async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = await UserSchema.create({
      _id: new mongoose.Types.ObjectId(),
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });


    user.save();
    return res.json({ user, token });
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    const user = await UserSchema.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!(await bcryptjs.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.email }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });

    return res.json({ user, token });
  },

  validateToken: async (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await UserSchema.findOne({
        email: decoded.email,
      });
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      return res.json({ user });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

  },

  renewToken: async (req, res) => {
    const { email } = req.body;
    const user = await UserSchema.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });

  },

};