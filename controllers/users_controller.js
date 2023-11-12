const bcrypt = require('bcrypt');
const User = require('../models/usersModel');
const jwt = require('jsonwebtoken');
const Manager = require('../models/Manager');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { __v: false });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteAllUsers = async (req, res) =>{
  try{
    await User.deleteMany({});
    return res.status(200).json("All Users Were Deleted")
  }catch (error){
    return res.status(500).json(error.message);
  }
}

exports.register = async (req, res) => {
  try {
    const { name, accountId, password } = req.body;
    console.log(req.body);

    const existingUser = await User.findOne({ accountId: accountId });

    if (existingUser) {
      return res.status(400).json('accountId already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      accountId: accountId,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();



    return res.status(200).json(savedUser);
  } catch (error) {
    console.log(error.message)
    return res.status(500).json(error.message);
  }
};


exports.login = async (req, res) => {
  try {
    const { accountId, password } = req.body;
    console.log(req.body)

    const user = await User.findOne({ accountId: accountId });

    if(user){
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = jwt.sign(
          { 
            userId: user._id,
             accountId: user.accountId,
              role: 'user' 
            },
          process.env.JWT_SECRET_KEY
        );

        return res.status(200).json({
          token: token,
          user: user,
          role: 'user'
        });
      } else {
        return res.status(401).json('Invalid password');
      }
    }

    
    const technician = await Manager.findOne({ username: accountId });

    if(technician){
      const isMatch = await bcrypt.compare(password, technician.password);

      if (isMatch) {
        const token = jwt.sign(
          { 
            userId: technician._id,
             username: technician.username,
              role: 'technician' 
            },
          process.env.JWT_SECRET_KEY
        );
  
        return res.status(200).json({
          token: token,
          user: technician,
          role: 'technician'
        });
      } else {
        return res.status(401).json('Invalid password');
      }
    }

    if(!user && !technician){
      return res.status(404).json('Not Found');
    }
  } catch (error) {
    console.log(error.message)
    return res.status(500).json(error.message);
  }
};

exports.getUser = async (req, res) => {
  try {
    const { token } = req.headers
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;


    const deletedUser = await User.findByIdAndDelete(userId);

    if (deletedUser) {
      return res.status(200).json({ message: 'User deleted successfully' });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  console.log(req.body)
  try {
    const userId = req.params.id;
    const { name, accountId, password } = req.body;

    const existingUser = await User.findOne({ accountId: accountId });

    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json('account pnid already exists with another user');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: name, accountId: accountId, password: hashedPassword },
      { $new: true }
    );

    if (updatedUser) {
      return res.status(200).json(updatedUser);
    } else {
      return res.status(404).json('User not found');
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const bucket = require('../utils/firebase')

const uuid = require("uuid");


exports.validateToken = (req,res) =>{
  try{
    const { token } = req.headers
    jwt.verify(token, process.env.JWT_SECRET_KEY,{

    },(error,cb) => {
      if(error){
        return res.status(400).json(error)
      }else{
        return res.status(200).json(cb)
      }
    })
  }catch (error){
    return res.status(500).json(error.message)
  }
}
