import { Router } from 'express';
import * as classController from '../controllers/classController';

const router = Router();

router.get('/', classController.getAllClasses);
router.post('/', classController.createClass);
router.get('/:id', classController.getClassById);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);

export default router;
