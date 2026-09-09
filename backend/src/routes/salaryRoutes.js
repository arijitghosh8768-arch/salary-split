import express from 'express';
import { getSalaryAndRule, saveSalaryRecord, updateBudgetRule } from '../controllers/salaryController.js';
import { authenticateToken } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/security.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSalaryAndRule);
router.post('/', auditMiddleware('SAVE_SALARY'), saveSalaryRecord);
router.put('/rule', auditMiddleware('UPDATE_BUDGET_RULE'), updateBudgetRule);

export default router;
