import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //Informacion del email
  const info = await transport.sendMail({
    from: '"Uptask - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "Uptask - Confirma tu cuenta",
    text: "Confirma tu cuenta en Uptask",
    html: `
    <p>Hola ${nombre}:</p>
    <p>Tu cuenta esta casi lista, solo debes comprobarla en el siguiente enlace:</p>
    <a href='${process.env.FRONTEND_URL}/confirmar/${token}'>Comprobar Cuenta</a>
    <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje.</p>
    `,
  });
};

const olvidoContraseña = async (datos) => {
  const { email, nombre, token } = datos;
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //Informacion del email
  const info = await transport.sendMail({
    from: '"Uptask - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "Uptask - Reestablecer password",
    text: "Cambia tu contraseña",
    html: `
    <p>Hola ${nombre}:</p>
    <p>Sigue este enlace para generar un nuevo password:</p>
    <a href='${process.env.FRONTEND_URL}/olvide-password/${token}'>Reestablecer Password</a>
    <p>Si no solicitaste un cambio de password, puedes ignorar el mensaje.</p>
    `,
  });
};

export { emailRegistro, olvidoContraseña };
