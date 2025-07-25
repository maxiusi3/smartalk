import { Router } from 'express';
import { InterestController } from '@/controllers/InterestController';

const router = Router();
const interestController = new InterestController();

// GET /api/v1/interests - 获取所有兴趣主题
router.get('/', interestController.getAllInterests);

export default router;
