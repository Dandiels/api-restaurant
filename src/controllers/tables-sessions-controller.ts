import { Request, Response, NextFunction } from "express";
import { knex } from "@/database/knex";
import { AppError } from "@/utils/AppError";
import { z } from "zod";

class TableSessionController
{
    async index(request: Request, response: Response, next: NextFunction)
    {
        try
        {
            const sessions = await knex<TableSessionRepository>("tables_sessions").orderBy("closed_at");
            
            response.json(sessions);
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
                table_id: z.number({ required_error: "Table ID is required.", invalid_type_error: "Table ID must be a number." }).gt(0, { message: "Table ID must be greater than 0." })
            });

            const { table_id } = bodySchema.parse(request.body);

            const table = await knex<TableRepository>("tables").where({ id: table_id }).first();

            if (!table)
            {
                throw new AppError("Table not found.", 404);
            }

            const session = await knex<TableSessionRepository>("tables_sessions").where({ table_id }).orderBy("opened_at", "desc").first();

            if (session && !session.closed_at)
            {
                throw new AppError("Table session is already opened.");
            }

            await knex<TableSessionRepository>("tables_sessions").insert({ table_id });
            
            response.status(201).json();
            return;
        }
        catch (error)
        {
            next(error);
        }
    }

    async update(request: Request, response: Response, next: NextFunction)
    {
        try
        {
            const id = z.string()
            .transform((value) => Number(value))
            .refine((value) => !isNaN(value), { message: "ID must be a number." })
            .refine((value) => value > 0, { message: "ID must be greater than 0." })
            .parse(request.params.id);

            const session = await knex<TableSessionRepository>("tables_sessions").where({ id }).first();

            if (!session)
            {
                throw new AppError("Table session not found.", 404);
            }

            if (session.closed_at)
            {
                throw new AppError("Table session is already closed.");
            }

            await knex<TableSessionRepository>("tables_sessions").update({ closed_at: knex.fn.now() }).where({ id });
            
            response.json();
            return;
        }
        catch (error)
        {
            next(error);
        }
    }
}

export { TableSessionController };