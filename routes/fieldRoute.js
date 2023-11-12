const express = require('express');
const router = express.Router();
const FormField = require('../models/FormField');

// Route: /api/formFields
router.get('/formFields/', async (req, res) => {
    try {
        const formFields = await FormField.find({});
        return res.status(200).json(formFields);
    } catch (error) {
        return res.status(500).json([]);
    }
});

router.post('/formFields/', async (req, res) => {
    try {
        console.log(req.body)
        const {
            title,
            answerDataType,
            group,
            form,
            hasRequiredDescription,
            requiredDescription,
        } = req.body
        const formField = new FormField({
            title: title,
            answerDataType: answerDataType,
            group: group,
            form: form,
            hasRequiredDescription:hasRequiredDescription,
            requiredDescription:requiredDescription
        })

        await formField.save()
        return res.status(200).json(formField);
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
    }
});

router.get('/formFields/:id', async (req, res) => {
    try {
        const formField = await FormField.findById(req.params.id);
        return res.status(200).json(formField);
    } catch (error) {
        return res.status(404).json({ error: 'FormField not found' });
    }
});

router.put('/formFields/:id', async (req, res) => {
    try {
        console.log(req.body)
        const formField = await FormField.findByIdAndUpdate(req.params.id, req.body, { $new: true });
        return res.status(200).json(formField);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.delete('/formFields/:id', async (req, res) => {
    try {
        await FormField.deleteOne({_id: req.params.id});
        return res.status(200).json({ message: 'FormField deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/formFields/form/:formName', async (req,res) =>{
    try{
        const {formName} = req.params

        const formFields = await FormField.find({ form: formName }).populate({
            path:'group',
            ref:'Group'
        })
        return res.status(200).json(formFields)
    }catch (error){
        console.log(error.message)
        return res.status(500).send(error.message)
    }
})

router.delete('/formFields', async (req, res) => {
    try {
        await FormField.deleteMany({})
        return res.status(200).json({ message: 'FormField deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
module.exports = router;
