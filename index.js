import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import usuarioRoute from "./routes/usuarioRoutes.js";
import proyectoRoute from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";

const app = express();
app.use(express.json()); //esta linea permite leer el body del request
dotenv.config();
conectarDB();

//Configurar CORS
const whiteList = [process.env.FRONTEND_URL];
const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.includes(origin)) {
      //Puede consultar la API
      callback(null, true);
    } else {
      //No esta permitido
      callback(new Error("Error de cors"));
    }
  },
};

app.use(cors(corsOptions));

//Routing
app.use("/api/usuarios", usuarioRoute);
app.use("/api/proyectos", proyectoRoute);
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

//Socket .io
import { Server } from "socket.io";
const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("Conectado a socket.io");

  // let cambioTarea = false;

  socket.on("abrir proyecto", (proyecto) => {
    socket.join(proyecto);
  });
  // socket.on("cerrar proyecto", (proyecto) => {
  //   socket.leave(proyecto);
  // });

  socket.on("nueva tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea agregada", tarea);
  });

  socket.on("eliminar tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea eliminada", tarea);
  });

  socket.on("editar tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea editada", tarea);
  });

  socket.on("completar tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea completada", tarea);
  });

  // socket.on("cambio tarea", () => {
  //   socket.to(proyecto).emit("tarea cambiada", cambioTarea);
  // });
});
