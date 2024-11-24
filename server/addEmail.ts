import { emails } from './db/emailSchema'; // Importa el esquema
import { emailsDb } from './db/emailsDb';   // Importa la conexión a la base de datos

export async function addEmail(email: string, source: string = "youtube-image-generator") {
  try {
    // Inserta el nuevo registro en la tabla `emails`
    const result = await emailsDb.insert(emails).values({
      email,
      source, // Usará el valor por defecto si no se proporciona uno
    });

    console.log("Email añadido con éxito:", result);
    return result;
  } catch (error) {
    console.error("Error añadiendo el email:", error);
    throw new Error("No se pudo añadir el email a la base de datos.");
  }
}

