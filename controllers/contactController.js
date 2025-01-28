const Contact = require('../models/contact');

exports.submitContactForm = async (req, res) => {
    const { name, email, message } = req.body;
    
    try {
        // Save the contact message to the database
        const newContact = new Contact({ name, email, message });
        await newContact.save();

        res.send('Thank you for your message! We have saved it successfully.');
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).send('An error occurred. Please try again later.');
    }
};