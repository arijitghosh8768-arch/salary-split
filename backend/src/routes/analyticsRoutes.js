import express from 'express';
import { getMonthlyHistory, getAuditLogs } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/history', getMonthlyHistory);
router.get('/audit-logs', getAuditLogs);

export default router;
