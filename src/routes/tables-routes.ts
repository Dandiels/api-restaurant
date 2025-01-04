import { Router } from "express";
import { TableController } from "@/controllers/tables-controller";

const tablesRoutes = Router();
const tablesController = new TableController();

tablesRoutes.get("/", tablesController.index);

export { tablesRoutes };