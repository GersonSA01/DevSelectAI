require('dotenv').config();
const nodemailer = require("nodemailer");

// Validar que las variables estén definidas
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ ERROR: EMAIL_USER o EMAIL_PASS no están definidos en .env");
  process.exit(1);
}

console.log("🧪 EMAIL_USER:", process.env.EMAIL_USER);
console.log("🧪 EMAIL_PASS:", "*".repeat(process.env.EMAIL_PASS.length)); // ocultar por seguridad

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  logger: true,
  debug: true
});

// Verificar conexión inicial
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Fallo al conectar con Gmail:", error);
  } else {
    console.log("✅ Conexión con Gmail exitosa");
  }
});

// Función para enviar correo
const sendEmail = async (to, subject, html) => {
  console.log("📨 Intentando enviar correo...");

  // Validación de parámetros
  if (!to || typeof to !== 'string') {
    return console.error("⚠️ Destinatario inválido:", to);
  }

  if (!subject || typeof subject !== 'string') {
    return console.error("⚠️ Asunto inválido:", subject);
  }

  if (!html || typeof html !== 'string') {
    return console.error("⚠️ HTML del cuerpo del mensaje inválido.");
  }

  console.log(`➡️ Destinatario: ${to}`);
  console.log(`➡️ Asunto: ${subject}`);

  try {
    const info = await transporter.sendMail({
      from: `"DevSelectAI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("📤 Correo enviado correctamente:");
    console.log("➡️ ID:", info.messageId);
    console.log("➡️ Accepted:", info.accepted);
    console.log("➡️ Rejected:", info.rejected);
    console.log("➡️ Response:", info.response);
  } catch (err) {
    console.error("❌ Error al enviar el correo:", err);
  }
};

module.exports = sendEmail;

// 🔍 Si ejecutas este archivo directamente, prueba enviar un correo de test
if (require.main === module) {
  console.log("🚀 Enviando correo de prueba...");
  sendEmail(
    "correo-de-prueba@unemi.edu.ec",
    "📧 Correo de prueba desde sendEmail.js",
    "<p>Este es un correo de prueba enviado directamente desde <strong>sendEmail.js</strong>.</p>"
  );
}
