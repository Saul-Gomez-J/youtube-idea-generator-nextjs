import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad de GeneradorIdeasYT</h1>
      <p className="mb-4"><strong>Fecha de entrada en vigor:</strong> 24 de noviembre de 2024</p>
      
      <p className="mb-4">
        La presente Política de Privacidad describe cómo <strong>Saul</strong> (&quot;nosotros&quot;, &quot;nuestro&quot; o &quot;nos&quot;) recopila, utiliza y protege la información personal de los usuarios (&quot;usted&quot; o &quot;usuario&quot;) de la aplicación <strong>GeneradorIdeasYT</strong> (&quot;la aplicación&quot; o &quot;el servicio&quot;).
      </p>
      
      <p className="mb-6">
        Al utilizar nuestra aplicación, usted acepta la recopilación y el uso de información de acuerdo con esta política.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Información que Recopilamos</h2>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">Datos Proporcionados por el Usuario</h3>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Información de Autenticación:</strong> Al autenticarte a través de OAuth utilizando Clerk, recopilamos su nombre y dirección de correo electrónico.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">Datos Recopilados Automáticamente</h3>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Cookies y Tecnologías Similares:</strong> Utilizamos cookies para funciones esenciales como la autenticación y para análisis del servicio.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">Datos de Terceros</h3>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Información de Fuentes Públicas:</strong> Recopilamos información de canales públicos de YouTube para analizar y generar ideas a partir de los videos y sus comentarios.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. Cómo Utilizamos su Información</h2>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Provisión del Servicio:</strong> Utilizamos su información de autenticación para permitirle acceder y utilizar la aplicación.</li>
        <li><strong>Comunicaciones:</strong> Podemos utilizar su correo electrónico para enviarle notificaciones y actualizaciones relacionadas con el servicio.</li>
        <li><strong>Marketing:</strong> Podremos enviarle comunicaciones promocionales, de las cuales puede optar por no recibir en cualquier momento.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. Compartir su Información</h2>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Con Terceros:</strong> No compartimos sus datos personales con terceros, excepto cuando sea necesario para cumplir con obligaciones legales.</li>
        <li><strong>Cumplimiento Legal:</strong> Podemos divulgar su información si es requerido por ley o en respuesta a solicitudes gubernamentales válidas.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. Seguridad de los Datos</h2>
      <p className="mb-4">Tomamos medidas razonables para proteger su información personal, incluyendo:</p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Tecnologías de Seguridad:</strong> Utilizamos Clerk, Cloudflare y JWT para proteger sus datos durante la transmisión y el almacenamiento.</li>
        <li><strong>Almacenamiento de Datos:</strong> Sus datos se almacenan en Neon DB y se conservan hasta que decidamos eliminarlos.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. Sus Derechos</h2>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Acceso y Control:</strong> Puede acceder, corregir o eliminar su información personal dándose de baja de nuestra aplicación.</li>
        <li><strong>Optar por No Recibir Comunicaciones:</strong> Puede optar por no recibir comunicaciones promocionales siguiendo las instrucciones proporcionadas en los correos electrónicos.</li>
        <li><strong>Presentar Quejas:</strong> Si tiene alguna preocupación sobre el manejo de sus datos, puede contactarnos en <strong>aineworldes@gmail.com</strong>.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cookies y Tecnologías Similares</h2>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Uso de Cookies:</strong> Utilizamos cookies para funciones esenciales como la autenticación y para análisis.</li>
        <li><strong>Gestión de Cookies:</strong> Puede seleccionar utilizar solo las cookies necesarias a través de la configuración de su navegador o de las opciones proporcionadas en la aplicación.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">7. Transferencia Internacional de Datos</h2>
      <p className="mb-4">No transferimos sus datos personales fuera del país de origen del usuario.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">8. Privacidad de Menores</h2>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Edad Mínima:</strong> Nuestra aplicación no establece una edad mínima para su uso.</li>
        <li><strong>Datos de Menores:</strong> No recopilamos intencionalmente información personal de menores de edad. Si es padre o tutor y tiene conocimiento de que su hijo nos ha proporcionado datos personales, contáctenos para que podamos tomar las medidas necesarias.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">9. Cambios en esta Política de Privacidad</h2>
      <p className="mb-4">Podemos actualizar nuestra Política de Privacidad periódicamente. Le notificaremos sobre cualquier cambio enviando una nueva política al correo electrónico proporcionado.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">10. Información de Contacto</h2>
      <p className="mb-4">Si tiene preguntas o inquietudes sobre esta Política de Privacidad, puede contactarnos en:</p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Correo Electrónico:</strong> aineworldes@gmail.com</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">11. Base Legal para el Procesamiento de Datos</h2>
      <p className="mb-4">Procesamos sus datos personales basándonos en el consentimiento que usted nos proporciona al utilizar nuestra aplicación.</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">12. Cumplimiento Legal</h2>
      <p className="mb-4">Cumplimos con las regulaciones de protección de datos aplicables en Europa, incluyendo el Reglamento General de Protección de Datos (GDPR).</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">13. Revisión y Actualización</h2>
      <p className="mb-4">Revisamos y actualizamos nuestras prácticas de manejo de datos una vez al mes para asegurar la protección continua de su información personal.</p>

      <hr className="my-8" />

      <p className="mb-4">
        Al utilizar GeneradorIdeasYT, usted reconoce que ha leído y entendido esta Política de Privacidad y acepta los términos y condiciones aquí establecidos.
      </p>

      <Link href="/" className="text-blue-600 hover:underline">
        Volver a la página principal
      </Link>
    </div>
  );
}
