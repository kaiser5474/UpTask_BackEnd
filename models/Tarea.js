import moongoose from "mongoose";

const tareaSchema = moongoose.Schema(
  {
    nombre: {
      type: String,
      trim: true,
      required: true,
    },
    descripcion: {
      type: String,
      trim: true,
      required: true,
    },
     nota: {
      type: String,
      trim: true,
      required: false,
    },
    estado: {
      type: Boolean,
      default: false,
    },
    fechaEntrega: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    prioridad: {
      type: String,
      required: true,
      enum: ["Baja", "Media", "Alta"],
    },
    proyecto: {
      type: moongoose.Schema.Types.ObjectId,
      ref: "Proyecto",
    },
    completado: {
      type: moongoose.Schema.Types.ObjectId,
      ref: "Usuario",
    },
  },
  {
    timestamps: true,
  }
);

const Tarea = moongoose.model("Tarea", tareaSchema);
export default Tarea;
