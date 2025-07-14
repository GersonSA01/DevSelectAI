require('dotenv').config();
const nodemailer = require("nodemailer");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ ERROR: EMAIL_USER o EMAIL_PASS no están definidos en .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"DevSelectAI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log("📤 Correo enviado a", to);
    return info;
  } catch (err) {
    console.error("❌ Error al enviar el correo:", err);
    throw err;
  }
};


const Templates = {
  registroExitoso: () => `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h1 style="color: white;">DevSelectAI</h1>
      </div>
      <div style="padding: 30px;">
        <h2>🎓 Bienvenido/a a DevSelectAI</h2>
        <p>Has sido registrado exitosamente en nuestro sistema de entrevistas inteligentes para prácticas preprofesionales.</p>
      </div>
    </div>
  `,

  vacanteAsignada: ({ nombre, apellido, vacante, enlace }) => `
    <div style="font-family: Arial; max-width: 700px; margin: auto;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h1 style="color: white;">DevSelectAI</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hola ${nombre} ${apellido},</p>
        <p>¡Felicidades! Has sido asignado a la vacante: <strong>${vacante}</strong></p>
        <p><a href="${enlace}" 
        style="background: #0f172a; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
        🎤 Iniciar entrevista</a></p>
      </div>
    </div>
  `,

  aprobado: ({ nombre, apellido, vacante, periodoPostulacion }) => `
    <div style="font-family: Arial; max-width: 700px; margin: auto;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h1 style="color: white;">DevSelectAI</h1>
      </div>
      <div style="padding: 30px; text-align: center;">
        <div style="font-size: 50px;">🎉</div>
        <h2>¡Felicidades ${nombre} ${apellido}!</h2>
        <p>Has sido <strong>APROBADO/A</strong> para la vacante <strong>${vacante}</strong></p>
        ${periodoPostulacion ? `<p>Periodo de postulación: ${periodoPostulacion}</p>` : ''}
        <p>¡Bienvenido a esta gran experiencia profesional!</p>
      </div>
    </div>
  `,

  rechazado: ({ nombre, apellido, vacante, periodoPostulacion }) => `
    <div style="font-family: Arial; max-width: 700px; margin: auto;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h1 style="color: white;">DevSelectAI</h1>
      </div>
      <div style="padding: 30px; text-align: center;">
        <div style="font-size: 50px;">😔</div>
        <h2>Resultado de tu postulación</h2>
        <p>Estimado/a <strong>${nombre} ${apellido}</strong>, lamentamos informarte que no has sido seleccionado para la vacante <strong>${vacante}</strong>.</p>
        ${periodoPostulacion ? `<p>Periodo de postulación: ${periodoPostulacion}</p>` : ''}
        <p>Queremos animarte a seguir intentándolo. ¡Mucho éxito!</p>
      </div>
    </div>
  `
};

module.exports = {
  sendEmail,
  Templates
};
