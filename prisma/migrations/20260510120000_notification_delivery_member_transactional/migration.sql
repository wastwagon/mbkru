-- Extend notification outbox for community (and future) member transactional delivery.
ALTER TYPE "NotificationDeliveryKind" ADD VALUE 'MEMBER_TRANSACTIONAL_EMAIL';
ALTER TYPE "NotificationDeliveryKind" ADD VALUE 'MEMBER_TRANSACTIONAL_SMS';
