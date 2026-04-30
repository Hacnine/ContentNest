import { Response } from 'express';
import { IPaginatedResult } from '../types';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): void {
  res.status(statusCode).json({ success: true, message, data });
}

export function sendError(res: Response, message: string, statusCode = 500, error?: string): void {
  res.status(statusCode).json({ success: false, message, error });
}

export function sendPaginated<T>(
  res: Response,
  result: IPaginatedResult<T>,
  message?: string
): void {
  res.status(200).json({ success: true, message, ...result });
}
