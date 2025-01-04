import { Router } from "express";
import { OrderController } from "@/controllers/orders-controller";

const ordersRoutes = Router();
const ordersController = new OrderController();

ordersRoutes.get("/table-session/:table_session_id", ordersController.index);
ordersRoutes.post("/", ordersController.create);
ordersRoutes.get("/table-session/:table_session_id/total", ordersController.show);

export { ordersRoutes };