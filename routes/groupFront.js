const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

router.get('/groups', async (req, res) => {
    try {
        let groups = await Group.find({});
        res.render('groups/index', { groups });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.get('/groups/create', (req, res) => {
    res.render('groups/create');
});

router.post('/groups', async (req, res) => {
    try {
        const { name, notice, text } = req.body;
        let group = new Group({ name, notice, text });
        await group.save();
        res.redirect('/groups');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.get('/groups/:id/edit', async (req, res) => {
    try {
        let group = await Group.findById(req.params.id);
        res.render('groups/edit', { group });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.put('/groups/:id', async (req, res) => {
    try {
        const { name, notice, text } = req.body;
        await Group.findByIdAndUpdate(req.params.id, { name, notice, text });
        res.redirect('/groups');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.post('/groups/:id', async (req, res) => {
    try {
        await Group.findByIdAndDelete(req.params.id);
        res.redirect('/groups');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
