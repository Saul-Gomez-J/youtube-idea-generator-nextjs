import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  const headerPayload = req.headers;
  const payload = await req.body;

  const webhook = new Webhook(WEBHOOK_SECRET);
  let event;

  try {
    event = webhook.verify(JSON.stringify(payload), headerPayload);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  const { id, email_addresses, ...attributes } = event.data;

  // Aquí es donde enviarías el correo electrónico a tu base de datos
  if (event.type === 'user.created') {
    const userEmail = email_addresses[0].email_address;
    await saveEmailToDatabase(userEmail);
  }

  res.status(200).json({ message: 'Webhook received' });
}

async function saveEmailToDatabase(email) {
  // Implementa aquí la lógica para guardar el email en tu base de datos
  // Por ejemplo:
  // await db.collection('users').insertOne({ email });
}