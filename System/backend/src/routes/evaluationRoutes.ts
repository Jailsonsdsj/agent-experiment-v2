import { Router } from 'express';
import * as evaluationController from '../controllers/evaluationController';

const router = Router();

router.patch('/', evaluationController.patchEvaluation);

export default router;
