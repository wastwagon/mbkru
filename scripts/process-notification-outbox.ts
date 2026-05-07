import { processNotificationOutboxBatch } from "@/lib/server/notification-outbox";

const raw = Number.parseInt(process.env.NOTIFICATION_OUTBOX_BATCH_SIZE ?? "50", 10);
const limit = Number.isFinite(raw) ? Math.min(Math.max(raw, 1), 200) : 50;

const result = await processNotificationOutboxBatch(limit);
console.log("[notification-outbox] processed", result.processed, "sent", result.sent, "failed", result.failed);
