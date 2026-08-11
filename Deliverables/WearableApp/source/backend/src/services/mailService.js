const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  MAIL_FROM_NAME = 'TraveXperience',
  MAIL_FROM_EMAIL = 'no-reply@travexperience.com',
} = process.env;

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: Number(MAIL_PORT) || 587,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `${MAIL_FROM_NAME} <${MAIL_FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Correo enviado a ${to} - messageId=${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error enviando correo a ${to}: ${error.message}`);
    throw error;
  }
};

const buildPasswordResetEmail = ({ fullName, resetLink, logoUrl }) => {
  const subject = 'Recupera tu contraseña en TraveXperience 🌍';
  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recupera tu contraseña</title>
    <style>
      body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #eef2ff; color: #0f172a; }
      .container { width: 100%; max-width: 680px; margin: 0 auto; padding: 24px; }
      .card { background: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 26px 90px rgba(15, 23, 42, 0.08); }
      .hero { background: linear-gradient(135deg, #0f172a 0%, #2563eb 60%, #38bdf8 100%); color: #ffffff; padding: 38px 32px; text-align: center; position: relative; }
      .hero::after { content: ''; position: absolute; top: 18px; right: 18px; width: 70px; height: 70px; background: rgba(255,255,255,0.12); border-radius: 50%; }
      .logo { display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; font-size: 26px; font-weight: 900; letter-spacing: -0.04em; margin-bottom: 12px; }
      .plane { display: inline-flex; width: 44px; height: 44px; align-items: center; justify-content: center; margin: 0 auto 16px; }
      .plane svg { width: 32px; height: 32px; }
      .hero h1 { margin: 0; font-size: 34px; line-height: 1.05; }
      .hero p { margin: 18px auto 0; max-width: 520px; font-size: 16px; color: rgba(255,255,255,0.92); }
      .content { padding: 34px 32px 40px; }
      .content h2 { margin: 0 0 18px; font-size: 24px; color: #111827; }
      .content p { margin: 0 0 18px; line-height: 1.8; color: #475569; }
      .button { display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 18px; font-weight: 700; }
      .footer { padding: 0 32px 28px; color: #64748b; font-size: 13px; line-height: 1.75; }
      .small { color: #94a3b8; font-size: 12px; }
      .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
      .logo-image { display: block; margin: 0 auto 16px; width: 150px; height: auto; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="hero">
          <img class="logo-image" src="${logoUrl}" alt="TraveXperience" />
          <div class="plane">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12L22 4L16 12L22 20L2 12Z" fill="rgba(255,255,255,0.85)"/>
              <path d="M6 12L22 4L16 12L22 20L6 12Z" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1>Recupera tu contraseña</h1>
          <p>Listo para seguir descubriendo destinos. Usa el botón para crear una nueva contraseña segura.</p>
        </div>
        <div class="content">
          <h2>Hola ${fullName || 'viajero'},</h2>
          <p>Hemos recibido una solicitud de recuperación de contraseña para tu cuenta de TraveXperience. Haz clic en el botón para volver a acceder y continuar tu viaje.</p>
          <p style="text-align:center; margin: 28px 0 20px;">
            <a class="button" href="${resetLink}" target="_blank">Restablecer mi contraseña</a>
          </p>
          <div class="divider"></div>
          <p>Si no solicitaste este cambio, ignora este correo. El enlace expirará en 1 hora.</p>
        </div>
        <div class="footer">
          <p>Gracias por viajar con TraveXperience.</p>
          <p class="small">TraveXperience | Tu plataforma para explorar hoteles, tours y experiencias auténticas.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  const text = `Hola ${fullName || 'viajero'},\n\n` +
    'Recibimos una solicitud para restablecer tu contraseña en TraveXperience. Haz clic en el siguiente enlace para continuar:\n\n' +
    `${resetLink}\n\n` +
    'Si no solicitaste este cambio, ignora este correo. El enlace expira en 1 hora.\n\n' +
    'Gracias por viajar con TraveXperience.';

  return { subject, html, text };
};

module.exports = {
  sendMail,
  buildPasswordResetEmail,
};
