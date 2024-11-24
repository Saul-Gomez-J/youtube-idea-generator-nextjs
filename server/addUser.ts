// db/addUser.js
import { emails } from './db/emailSchema'; // Importa el esquema
import { emailsDb } from './db/emailsDb';   // Importa la conexión a la base de datos

export async function addUser(email: string, name: string, source: string = "youtube-image-generator") {
  try {
    // Inserta el nuevo registro en la tabla `emails`
    const result = await emailsDb.insert(emails).values({
      email,
      name,   // Guarda el nombre del usuario
      source, // Usará el valor por defecto si no se proporciona uno
    });

    console.log("Usuario añadido con éxito:", result);
    return result;
  } catch (error) {
    console.error("Error añadiendo el usuario:", error);
    throw new Error("No se pudo añadir el usuario a la base de datos.");
  }
}

