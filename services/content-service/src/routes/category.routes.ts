import { Router } from 'express';
import * as controller from '../controllers/category.controller';

const router = Router();

// ─── Categories ───────────────────────────────────────────────────────────────
router.get('/categories', controller.getCategories);
router.post('/categories', controller.createCategory);
router.put('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

// ─── Tags ─────────────────────────────────────────────────────────────────────
router.get('/tags', controller.getTags);
router.post('/tags', controller.createTag);
router.delete('/tags/:id', controller.deleteTag);

export default router;
