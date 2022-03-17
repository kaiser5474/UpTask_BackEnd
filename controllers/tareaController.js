import Tarea from "../models/Tarea.js";
import Proyecto from "../models/Proyecto.js";

const createTarea = async (req, res) => {
  const { proyecto } = req.body;

  const existeProyecto = await Proyecto.findById(proyecto);

  if (!existeProyecto) {
    const error = new Error("No existe el proyecto");
    return res.status(404).json({ msg: error.message });
  }

  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes permiso para añadir tareas");
    return res.status(403).json({ msg: error.message });
  }
  try {
    const tareaInsert = await Tarea.create(req.body);
    res.json({ msg: "Tarea insertada", tarea: tareaInsert });
  } catch (error) {
    console.log(error);
  }
};
const readTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id)
    .populate("proyecto")
    .populate("completado");

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no valida");
    return res.status(403).json({ msg: error.message });
  }
  res.json({ tarea });
};

const updateTarea = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, prioridad, estado } = req.body;
  const tarea = await Tarea.findById(id).populate("proyecto");

  //Compruebo que exista la tarea
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  //Compruebo que el creador del proyecto sea el mismo usuario que esta logueado
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no valida");
    return res.status(403).json({ msg: error.message });
  }
  tarea.nombre = nombre || tarea.nombre;
  tarea.descripcion = descripcion || tarea.descripcion;
  tarea.prioridad = prioridad || tarea.prioridad;
  tarea.estado = estado || tarea.estado;

  try {
    tarea.depopulate("proyecto");
    const tareaActualizada = await tarea.save();
    return res.json({ msg: "Tarea actualizada", tarea: tareaActualizada });
  } catch (error) {
    console.log(error);
  }
};
const deleteTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");
  //Compruebo que exista la tarea
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }
  //Compruebo que el creador del proyecto sea el mismo usuario que esta logueado
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no valida");
    return res.status(403).json({ msg: error.message });
  }
  try {
    tarea.depopulate("proyecto");
    await tarea.deleteOne();
    return res.json({ msg: "Tarea eliminada", tarea });
  } catch (error) {
    console.log(error);
  }
};

const readTareasByProyecto = async (req, res) => {
  const { id } = req.params;
  const tareas = await Tarea.find()
    .where("proyecto")
    .equals(id)
    .populate("completado", "nombre email");

  if (!tareas) {
    const error = new Error("No se encontraron tareas");
    return res.status(404).json({ msg: error.message });
  }
  // if (tareas.proyecto.creador.toString() !== req.usuario._id.toString()) {
  //   const error = new Error("Acción no valida");
  //   return res.status(403).json({ msg: error.message });
  // }
  res.json({ tareas });
};

const changeConditionTarea = async (req, res) => {
  const id = req.params.id;
  const tarea = await Tarea.findById(id).populate("proyecto");
  //.populate("completado", "nombre email");

  //Compruebo que exista la tarea
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }
  //Compruebo que el usuario logueado sea el creador o un colaborador
  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Accion no valida");
    return res.status(401).json({ msg: error.message });
  }
  tarea.depopulate("proyecto");
  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id;
  await tarea.save();

  const tareaActualizada = await Tarea.findById(id).populate("completado");

  res.json({
    msg: "Estado actualizado correctamente",
    tareaActualizada,
  });
};

export {
  createTarea,
  readTarea,
  updateTarea,
  deleteTarea,
  changeConditionTarea,
  readTareasByProyecto,
};
