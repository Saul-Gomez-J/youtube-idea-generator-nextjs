// pages/api/webhooks/clerk.js
import { Webhook } from 'svix';
import { buffer } from 'micro';
import { addUser } from '../../../db/addUser'; // Asegúrate de la ruta correcta

export const config = {
  api: {
    bodyParser: false, // Desactivamos el body parser para leer el payload crudo
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  const svixWebhook = new Webhook(WEBHOOK_SECRET);

  let event;

  try {
    // Lee el payload en formato crudo
    const payload = (await buffer(req)).toString();
    const headers = req.headers;

    // Verifica la firma del webhook
    event = svixWebhook.verify(payload, headers);
  } catch (err) {
    console.error('Error verificando el webhook:', err.message);
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  // Maneja los eventos según su tipo
  if (event.type === 'user.created') {
    const { email_addresses, first_name, last_name } = event.data;
    const userEmail = email_addresses[0]?.email_address;
    const firstName = first_name || '';
    const lastName = last_name || '';
    const userName = `${firstName} ${lastName}`.trim();

    if (!userEmail) {
      console.error('No se proporcionó un correo electrónico válido.');
      return res.status(400).json({ message: 'Invalid user email' });
    }

    try {
      // Construye el objeto para insertar
      const userData = {
        email: userEmail,
        name: userName,
        source: "webhook-clerk", // Ejemplo de fuente
      };

      await addUser(userData);
      console.log(`Usuario guardado: ${userEmail}, Nombre: ${userName}`);
    } catch (err) {
      console.error('Error guardando en la base de datos:', err.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // Respuesta exitosa
  res.status(200).json({ message: 'Webhook received successfully' });
}
