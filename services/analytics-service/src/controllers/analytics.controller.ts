import { Request, Response, NextFunction } from 'express';
import { UAParser } from 'ua-parser-js';
import { PageView } from '../models/Analytics.model';
import { sendSuccess } from '@contentnest/shared';
import crypto from 'crypto';

export async function trackPageView(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { postId, postSlug, postTitle, referrer } = req.body;

    if (!postId || !postSlug) {
      res.status(400).json({ success: false, message: 'postId and postSlug required' });
      return;
    }

    const ua = req.headers['user-agent'] || '';
    const parser = new UAParser(ua);
    const device = parser.getDevice().type === 'mobile' ? 'mobile'
      : parser.getDevice().type === 'tablet' ? 'tablet' : 'desktop';

    // Anonymous visitor fingerprint (no PII stored)
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';
    const visitorId = crypto
      .createHash('sha256')
      .update(`${ip}${ua}${new Date().toDateString()}`)
      .digest('hex');

    await PageView.create({
      postId,
      postSlug,
      postTitle,
      visitorId,
      referrer,
      userAgent: ua.substring(0, 255),
      device,
    });

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days as string, 10));

    const [totalViews, uniqueVisitors, popularPosts, viewsByDate] = await Promise.all([
      PageView.countDocuments({ createdAt: { $gte: since } }),
      PageView.distinct('visitorId', { createdAt: { $gte: since } }).then((v) => v.length),
      PageView.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { postId: '$postId', slug: '$postSlug', title: '$postTitle' },
            views: { $sum: 1 },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            postId: '$_id.postId',
            slug: '$_id.slug',
            title: '$_id.title',
            views: 1,
          },
        },
      ]),
      PageView.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            views: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', views: 1 } },
      ]),
    ]);

    sendSuccess(res, { totalViews, uniqueVisitors, popularPosts, viewsByDate });
  } catch (err) {
    next(err);
  }
}

export async function getPostAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days as string, 10));

    const [totalViews, uniqueVisitors, viewsByDate, deviceBreakdown] = await Promise.all([
      PageView.countDocuments({ postId: id, createdAt: { $gte: since } }),
      PageView.distinct('visitorId', { postId: id, createdAt: { $gte: since } }).then((v) => v.length),
      PageView.aggregate([
        { $match: { postId: id, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            views: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', views: 1 } },
      ]),
      PageView.aggregate([
        { $match: { postId: id, createdAt: { $gte: since } } },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $project: { _id: 0, device: '$_id', count: 1 } },
      ]),
    ]);

    sendSuccess(res, { totalViews, uniqueVisitors, viewsByDate, deviceBreakdown });
  } catch (err) {
    next(err);
  }
}
