import { Router } from 'express';
import { iniciarAnalise } from '../controllers/analiseController.js';
import { downloadRelatorio } from '../controllers/downloadController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.post('/analise', protect, iniciarAnalise);
router.get('/download/:fileName', downloadRelatorio); 

export default router;