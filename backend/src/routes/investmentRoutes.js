import express from 'express';
import { getInvestments, addInvestment, deleteInvestment } from '../controllers/investmentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/security.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getInvestments);
router.post('/', auditMiddleware('ADD_INVESTMENT'), addInvestment);
router.delete('/:id', auditMiddleware('DELETE_INVESTMENT'), deleteInvestment);

export default router;
