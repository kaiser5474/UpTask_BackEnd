import express from "express";
import {
  getProyectos,
  createProyecto,
  updateProyecto,
  deleteProyecto,
  getProyecto,
  selectColaborador,
  createColaborador,
  eliminarColaborador,
  readColaboradoresByProyecto,
} from "../controllers/proyectoController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.route("/").get(checkAuth, getProyectos).post(checkAuth, createProyecto);
router
  .route("/:id")
  .get(checkAuth, getProyecto)
  .put(checkAuth, updateProyecto)
  .delete(checkAuth, deleteProyecto);
router.post("/colaborador", checkAuth, selectColaborador);
router.route("/colaborador/:id").post(checkAuth, createColaborador);
router.get("/colaboradores/:id", checkAuth, readColaboradoresByProyecto);
router.post("/eliminar-colaborador/:id", checkAuth, eliminarColaborador);

export default router;
