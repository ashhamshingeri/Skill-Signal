import { Router } from 'express';
import { query } from '../database/connection.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const notificationsRouter = Router();

// GET /api/notifications
notificationsRouter.get('/', asyncHandler(async (req, res) => {
  const { userId, limit = 20 } = req.query;

  let queryText = `SELECT * FROM notifications `;
  const params: unknown[] = [];

  if (userId) {
    queryText += `WHERE user_id = $1 OR user_id IS NULL `;
    params.push(userId);
  }

  queryText += `ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(parseInt(limit as string, 10));

  const result = await query(queryText, params);
  const unreadCountResult = await query(
    `SELECT COUNT(*) as unread_count FROM notifications WHERE is_read = false ${userId ? 'AND (user_id = $1 OR user_id IS NULL)' : ''}`,
    userId ? [userId] : []
  );

  res.json({
    notifications: result.rows.map(n => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data,
      isRead: n.is_read,
      createdAt: n.created_at,
    })),
    unreadCount: parseInt(unreadCountResult.rows[0].unread_count || '0', 10),
  });
}));

// PATCH /api/notifications/:id/read
notificationsRouter.patch('/:id/read', asyncHandler(async (req, res) => {
  const { id } = req.params;

  await query('UPDATE notifications SET is_read = true WHERE id = $1', [id]);

  res.json({ success: true, message: 'Notification marked as read' });
}));

// POST /api/notifications/mark-all-read
notificationsRouter.post('/mark-all-read', asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (userId) {
    await query('UPDATE notifications SET is_read = true WHERE user_id = $1 OR user_id IS NULL', [userId]);
  } else {
    await query('UPDATE notifications SET is_read = true');
  }

  res.json({ success: true, message: 'All notifications marked as read' });
}));
