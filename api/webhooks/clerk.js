// pages/api/webhooks/clerk.js
import { Webhook } from 'svix';
import { buffer } from 'micro';
import { addUser } from '../../../server/addUser';

/**
 * Configuration to disable the default body parser
 * This is required for webhook verification
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Extracts user data from the webhook event
 * @param {Object} eventData - The event data from Clerk
 * @returns {Object} Extracted user information
 */
const extractUserData = (eventData) => {
  const { email_addresses, first_name, last_name } = eventData;
  const userEmail = email_addresses?.[0]?.email_address ?? '';
  const firstName = first_name ?? '';
  const lastName = last_name ?? '';
  const userName = `${firstName} ${lastName}`.trim();

  return { userEmail, userName };
};

/**
 * Webhook handler for Clerk events
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('WEBHOOK_SECRET is not defined');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const svixWebhook = new Webhook(webhookSecret);
  let event;

  try {
    const rawBody = await buffer(req);
    const payload = rawBody.toString();
    const svixHeaders = req.headers;

    event = svixWebhook.verify(payload, svixHeaders);
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  if (event.type === 'user.created') {
    const { userEmail, userName } = extractUserData(event.data);

    if (!userEmail) {
      console.error('No valid email provided');
      return res.status(400).json({ message: 'Invalid user email' });
    }

    try {
      await addUser(userEmail, userName);
      console.log('User saved successfully:', { email: userEmail, name: userName });
    } catch (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  return res.status(200).json({ message: 'Webhook processed successfully' });
};

export default handler;