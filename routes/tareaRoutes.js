import express from "express";
import {
  createTarea,
  readTarea,
  updateTarea,
  deleteTarea,
  changeConditionTarea,
  readTareasByProyecto,
} from "../controllers/tareaController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();
router.post("/", checkAuth, createTarea);
router
  .route("/:id")
  .get(checkAuth, readTarea)
  .put(checkAuth, updateTarea)
  .delete(checkAuth, deleteTarea);
router.route("/proyecto/:id").get(checkAuth, readTareasByProyecto);
router.post("/estado/:id", checkAuth, changeConditionTarea);

export default router;
