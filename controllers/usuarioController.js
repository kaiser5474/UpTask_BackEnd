import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, olvidoContraseña } from "../helpers/email.js";

const registrar = async (req, res) => {
  //evitar registros duplicados
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ email });
  if (existeUsuario) {
    const error = new Error("Usuario ya registrado");
    return res.status(400).json({ msg: error.message });
  }
  try {
    const usuario = new Usuario(req.body);
    usuario.token = generarId();
    await usuario.save();

    //Enviar email de confirmacion al usuario
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });
    res.json({
      msg: "Usuario creado correctamente, revisa tu email para confirmar tu cuenta",
    });
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;
  //Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }
  //Comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    const error = new Error("Tu cuenta no ha sido confirmada");
    return res.status(404).json({ msg: error.message });
  }
  //Comprobar su password
  const passwordCorrecto = await bcrypt.compare(password, usuario.password);
  if (!passwordCorrecto) {
    const error = new Error("Contraseña incorrecta");
    return res.status(404).json({ msg: error.message });
  }
  //Retornar objeto que contiene al usuario logueado
  res.json({
    _id: usuario._id,
    nombre: usuario.nombre,
    email,
    token: generarJWT(usuario._id),
  });
};

const confirmar = async (req, res) => {
  //comprobar que el token sea valido
  const { token } = req.params;
  const usuarioConfirmar = await Usuario.findOne({ token });
  if (!usuarioConfirmar) {
    const error = new Error("Token no valido");
    return res.status(400).json({ msg: error.message });
  }
  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = "";
    await usuarioConfirmar.save();
    res.json({ msg: "Usuario confirmado correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const olvidePassword = async (req, res) => {
  const { email } = req.body;
  //Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }
  try {
    usuario.token = generarId();
    await usuario.save();

    //Enviar el email para cambiar contraseña
    await olvidoContraseña({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });
    res.json({ msg: "Hemos enviado un email con las instrucciones" });
  } catch (error) {
    console.log(error);
  }
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;
  const tokenValido = await Usuario.findOne({ token });
  if (!tokenValido) {
    const error = new Error("Token no valido");
    return res.status(400).json({ msg: error.message });
  } else {
    res.json({ msg: "Token valido y el usuario existe" });
  }
};

const nuevoPassword = async (req, res) => {
  const { password } = req.body;
  //comprobar que el token sea valido
  const { token } = req.params;
  const usuarioEditar = await Usuario.findOne({ token });
  if (!usuarioEditar) {
    const error = new Error("Token no valido");
    return res.status(400).json({ msg: error.message });
  }
  try {
    usuarioEditar.password = password;
    usuarioEditar.token = "";
    await usuarioEditar.save();
    res.json({ msg: "Password modificado correctamente" });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

const perfil = async (req, res) => {
  const usuario = req.usuario;
  res.json(usuario);
};

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
