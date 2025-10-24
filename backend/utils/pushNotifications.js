const webpush = require('web-push');

// VAPID keys (generate these once)
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
  'mailto:mokamahesh77@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store user subscriptions
const userSubscriptions = new Map();

const subscribeUser = (userId, subscription) => {
  userSubscriptions.set(userId, subscription);
};

const sendPushNotification = (userId, title, body, data = {}) => {
  const subscription = userSubscriptions.get(userId);
  
  if (!subscription) {
    console.log('No subscription found for user:', userId);
    return;
  }

  const payload = JSON.stringify({
    title,
    body,
    icon: '/icons/icon-192x192.png',
    data: {
      url: data.url || '/',
      ...data
    }
  });

  webpush.sendNotification(subscription, payload)
    .then(() => console.log('Push notification sent to:', userId))
    .catch(error => console.error('Push notification error:', error));
};

// Notification triggers
const notifyNewOrder = (farmerId, order) => {
  sendPushNotification(
    farmerId,
    'New Order Received!',
    `You have a new order #${order.orderNumber}`,
    { url: `/farmer/orders/${order._id}` }
  );
};

const notifyOrderUpdate = (consumerId, order, status) => {
  sendPushNotification(
    consumerId,
    'Order Status Updated',
    `Your order #${order.orderNumber} is now ${status}`,
    { url: `/orders/${order._id}` }
  );
};

module.exports = {
  subscribeUser,
  sendPushNotification,
  notifyNewOrder,
  notifyOrderUpdate
};