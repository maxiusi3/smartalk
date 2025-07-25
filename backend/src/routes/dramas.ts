import { Router } from 'express';
import { DramaController } from '@/controllers/DramaController';

const router = Router();
const dramaController = new DramaController();

// GET /api/v1/dramas/by-interest/:interestId - 根据兴趣获取剧集
router.get('/by-interest/:interestId', dramaController.getDramasByInterest);

// GET /api/v1/dramas/:dramaId/keywords - 获取剧集的词汇数据
router.get('/:dramaId/keywords', dramaController.getDramaKeywords);

export default router;
