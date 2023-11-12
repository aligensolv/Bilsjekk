const express = require('express');
const router = express.Router();
const Map = require('../models/Map');
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')

// Render the list of maps
router.get('/maps', async (req, res) => {
    try {
        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })
        const maps = await Map.find().populate('zone'); // If you have a reference to the Zone model
        res.render('maps/read', { 
            maps,
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
        });
    } catch (err) {
        console.error('Error fetching maps:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Render the edit form for a map
router.get('/maps/:id/edit', async (req, res) => {
    try {
        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })
        const map = await Map.findById(req.params.id);
        res.render('maps/edit', {
            map,
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
        });
    } catch (err) {
        console.error('Error fetching map:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Render the create form for a map
router.get('/maps/create',async (req, res) => {
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })
    res.render('maps/create',{
        isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    });
});


module.exports = router;
