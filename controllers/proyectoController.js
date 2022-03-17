import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import Usuario from "../models/Usuario.js";

const getProyectos = async (req, res) => {
  const { _id } = req.usuario;
  const listadoProyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  });
  res.json({ listadoProyectos });
};

const createProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;
  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json({ msg: "Proyecto guardado exitosamente", proyectoAlmacenado });
  } catch (error) {
    res.status(400).json({ msg: "Error al guardar el proyecto", error });
  }
};

const updateProyecto = async (req, res) => {
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id);
  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(401).json({ msg: error.message });
  }
  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json({ msg: "Proyecto actualizado", proyectoAlmacenado });
  } catch (error) {
    console.log(error);
  }
};

const deleteProyecto = async (req, res) => {
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id);
  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(401).json({ msg: error.message });
  }
  try {
    const proyectoEliminado = await proyecto.deleteOne();
    res.json({ msg: "Proyecto eliminado", proyectoEliminado });
  } catch (error) {
    console.log(error);
  }
};

const getProyecto = async (req, res) => {
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id);
  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }
  //Compruebo que el usuario logueado sea el creador o un colaborador
  if (
    proyecto.creador.toString() !== req.usuario._id.toString() &&
    !proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Accion no valida");
    return res.status(401).json({ msg: error.message });
  }
  const tareas = await Tarea.find().where("proyecto").equals(id);
  res.json({ msg: "Proyecto encontrado", proyecto, tareas });
};

const selectColaborador = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -updatedAt -password -token -__v -createdAt"
  );
  // const proyecto = await Proyecto.findOne(usuario._id);
  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }
  // if (proyecto.creador.toString() === usuario._id.toString()) {
  //   const error = new Error("El creador del proyecto no puede ser colaborador");
  //   return res.status(404).json({ msg: error.message });
  // }

  res.json({ msg: "Usuario encontrado", usuario });
};

const readColaboradoresByProyecto = async (req, res) => {
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id).populate(
    "colaboradores",
    "nombre email"
  );
  const { colaboradores } = proyecto;

  if (!colaboradores) {
    const error = new Error("No se encontraron colaboradores");
    return res.status(404).json({ msg: error.message, colaboradores });
  }
  // // if (tareas.proyecto.creador.toString() !== req.usuario._id.toString()) {
  // //   const error = new Error("Acción no valida");
  // //   return res.status(403).json({ msg: error.message });
  // // }
  res.json({ colaboradores });
  try {
  } catch (error) {
    console.log(error);
  }
};

const createColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);
  const _id = req.body._id;
  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }
  //Verifico que solo pueda insertar un colaborador el creador del proyecto
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(401).json({ msg: error.message });
  }
  //Comprobar que el colaborador no sea el creador del proyecto
  if (proyecto.creador.toString() === _id.toString()) {
    const error = new Error("El creador del proyecto no puede ser colaborador");
    return res.status(404).json({ msg: error.message });
  }
  //Comprobar que el colaborador que se va a insertar no este ya en el Arreglo del Colaboradores en el Proyecto
  if (proyecto.colaboradores.includes(_id)) {
    const error = new Error("El colaborador ya existe en el Proyecto");
    return res.status(404).json({ msg: error.message });
  }
  proyecto.colaboradores.push(_id);
  await proyecto.save();
  try {
    res.json({ msg: "Colaborador insertado correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);
  const _id = req.body.idColaborador;

  if (!proyecto) {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(401).json({ msg: error.message });
  }
  proyecto.colaboradores.pull(_id);
  await proyecto.save();
  try {
    res.json({ msg: "Colaborador eliminado correctamente" });
  } catch (error) {
    console.log(error);
  }
};

export {
  getProyectos,
  createProyecto,
  updateProyecto,
  deleteProyecto,
  getProyecto,
  selectColaborador,
  createColaborador,
  eliminarColaborador,
  readColaboradoresByProyecto,
};
