import { Router } from 'express';
import * as evaluationController from '../controllers/evaluationController';

const router = Router();

router.get('/summary', evaluationController.getEvaluationSummary);
router.patch('/', evaluationController.patchEvaluation);

export default router;
