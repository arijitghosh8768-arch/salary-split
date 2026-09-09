import express from 'express';
import { getExpenses, addExpense, deleteExpense } from '../controllers/expenseController.js';
import { authenticateToken } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/security.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getExpenses);
router.post('/', auditMiddleware('ADD_EXPENSE'), addExpense);
router.delete('/:id', auditMiddleware('DELETE_EXPENSE'), deleteExpense);

export default router;
