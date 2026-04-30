import cron from 'node-cron';
import axios from 'axios';
import { config } from '../config';

export function startPublishJob(): void {
  // Run every minute to check for scheduled posts
  cron.schedule('* * * * *', async () => {
    try {
      const response = await axios.post(
        `${config.contentServiceUrl}/api/posts/internal/publish-scheduled`,
        {},
        {
          headers: { 'x-scheduler-token': config.schedulerToken },
          timeout: 10000,
        }
      );

      const { data } = response;
      if (data?.data?.published > 0) {
        console.log(`[Scheduler] Published ${data.data.published} scheduled post(s)`);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('[Scheduler] Failed to trigger publish:', err.message);
      } else {
        console.error('[Scheduler] Unexpected error:', err);
      }
    }
  });

  console.log('[Scheduler] Publish job started (runs every minute)');
}
