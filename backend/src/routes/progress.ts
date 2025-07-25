import { Router } from 'express';
import { ProgressController } from '@/controllers/ProgressController';

const router = Router();
const progressController = new ProgressController();

// POST /api/v1/progress/unlock - 解锁词汇进度
router.post('/unlock', progressController.unlockKeyword);

export default router;
