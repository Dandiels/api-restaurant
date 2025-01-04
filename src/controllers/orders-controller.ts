import { Request, Response, NextFunction } from "express";
import { knex } from "@/database/knex";
import { AppError } from "@/utils/AppError";
import { z } from "zod";

class OrderController
{
    async index(request: Request, response: Response, next: NextFunction)
    {
        try
        {
            const table_session_id = z.string()
            .transform((value) => Number(value))
            .refine((value) => !isNaN(value), { message: "Table session ID must be a number." })
            .refine((value) => value > 0, { message: "Table session ID must be greater than 0." })
            .parse(request.params.table_session_id);

            const session = await knex<TableSessionRepository>("tables_sessions").where({ id: table_session_id }).first();

            if (!session)
            {
                throw new AppError("Table session not found.", 404);
            }
            
            const orders = await knex<OrderRepository>("orders")
            .select("orders.id", "orders.table_session_id", "orders.product_id", "products.name", "orders.price", "orders.quantity", knex.raw("(orders.price * orders.quantity) AS total"), "orders.created_at", "orders.updated_at")
            .join("products", "products.id", "orders.product_id")
            .where({ table_session_id })
            .orderBy("orders.created_at", "desc");

            if (!orders.length)
            {
                response.json("No orders found in this table session.");
                return;
            }
            
            response.json(orders);
            return;
        }
        catch (error)
        {
            next(error);
        }
    }

    async create(request: Request, response: Response, next: NextFunction)
    {
        try
        {
            const bodySchema = z.object
            ({
                table_session_id: z.number({ required_error: "Table session ID is required.", invalid_type_error: "Table session ID must be a number." }).gt(0, { message: "Table session ID must be greater than 0." }),
                product_id: z.number({ required_error: "Product ID is required.", invalid_type_error: "Product ID must be a number." }).gt(0, { message: "Product ID must be greater than 0." }),
                quantity: z.number({ required_error: "Quantity is required.", invalid_type_error: "Quantity must be a number." }).gt(0, { message: "Quantity must be greater than 0." })
            });

            const { table_session_id, product_id, quantity } = bodySchema.parse(request.body);

            const session = await knex<TableSessionRepository>("tables_sessions").where({ id: table_session_id }).first();

            if (!session)
            {
                throw new AppError("Table session not found.", 404);
            }

            if (session.closed_at)
            {
                throw new AppError("Table session is closed.");
            }

            const product = await knex<ProductRepository>("products").where({ id: product_id }).first();

            if (!product)
            {
                throw new AppError("Product not found.", 404);
            }

            await knex<OrderRepository>("orders").insert({ table_session_id, product_id, quantity, price: product.price });
            
            response.status(201).json();
            return;
        }
        catch (error)
        {
            next(error);
        }
    }

    async show(request: Request, response: Response, next: NextFunction)
    {
        try
        {
            const table_session_id = z.string()
            .transform((value) => Number(value))
            .refine((value) => !isNaN(value), { message: "Table session ID must be a number." })
            .refine((value) => value > 0, { message: "Table session ID must be greater than 0." })
            .parse(request.params.table_session_id);

            const session = await knex<TableSessionRepository>("tables_sessions").where({ id: table_session_id }).first();

            if (!session)
            {
                throw new AppError("Table session not found.", 404);
            }
            
            const orders = await knex<OrderRepository>("orders").where({ table_session_id });

            if (!orders.length)
            {
                throw new AppError("No orders found in this table session.");
            }

            const account = await knex<OrderRepository>("orders")
            .select(knex.raw("SUM(orders.price * orders.quantity) AS total"))
            .sum("orders.quantity AS quantity")
            .where({ table_session_id })
            .first();

            response.json(account);
            return;
        }
        catch (error)
        {
            next(error);
        }
    }
}

export { OrderController };