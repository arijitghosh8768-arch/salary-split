import express from 'express';
import { getGoals, createGoal, updateGoalProgress, deleteGoal } from '../controllers/goalController.js';
import { authenticateToken } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/security.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getGoals);
router.post('/', auditMiddleware('CREATE_GOAL'), createGoal);
router.put('/:id', auditMiddleware('UPDATE_GOAL'), updateGoalProgress);
router.delete('/:id', auditMiddleware('DELETE_GOAL'), deleteGoal);

export default router;
