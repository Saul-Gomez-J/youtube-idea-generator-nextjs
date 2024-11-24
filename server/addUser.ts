// db/addUser.js
import { emails, email } from './db/emailSchema'; // Importa el esquema y el tipo inferido
import { emailsDb } from './db/emailsDb';         // Importa la conexión a la base de datos

export async function addUser(userData: Partial<email>) {
  try {
    // Inserta el nuevo registro en la tabla `emails`
    const result = await emailsDb.insert(emails).values({
      email: userData.email!,
      name: userData.name!,
      source: userData.source ?? "youtube-image-generator",
    });

    console.log("Usuario añadido con éxito:", result);
    return result;
  } catch (error) {
    console.error("Error añadiendo el usuario:", error);
    throw new Error("No se pudo añadir el usuario a la base de datos.");
  }
}
