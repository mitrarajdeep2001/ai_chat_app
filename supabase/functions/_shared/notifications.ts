/**
 * Notification stub.
 */
export async function sendPushNotification(userIds: string[], payload: any): Promise<void> {
  // TODO: integrate push notification service (e.g. Firebase Cloud Messaging / APNs)
  console.log(`[Notification Stub] Sending push to ${userIds.length} users with payload:`, payload);
  return Promise.resolve();
}
