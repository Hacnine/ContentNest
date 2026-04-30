import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { Category } from '../models/Category.model';
import { Tag } from '../models/Tag.model';
import { sendSuccess, sendError } from '@contentnest/shared';

function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }
  next();
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    sendSuccess(res, category, 'Category created', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) { sendError(res, 'Category not found', 404); return; }
    sendSuccess(res, category, 'Category updated');
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) { sendError(res, 'Category not found', 404); return; }
    sendSuccess(res, null, 'Category deleted');
  } catch (err) {
    next(err);
  }
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function getTags(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tags = await Tag.find().sort({ name: 1 }).lean();
    sendSuccess(res, tags);
  } catch (err) {
    next(err);
  }
}

export async function createTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tag = await Tag.create({ name: req.body.name });
    sendSuccess(res, tag, 'Tag created', 201);
  } catch (err) {
    next(err);
  }
}

export async function deleteTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) { sendError(res, 'Tag not found', 404); return; }
    sendSuccess(res, null, 'Tag deleted');
  } catch (err) {
    next(err);
  }
}
