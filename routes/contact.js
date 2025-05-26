import express from 'express';
import { submitContactForm } from '../controllers/contactController.js';
import { buysell } from '../controllers/BuyController.js';

const router = express.Router();
router.post('/contact', submitContactForm);
router.post('/buyform',buysell)

export default router;
