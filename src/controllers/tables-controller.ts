import { Request, Response, NextFunction } from "express";
import { knex } from "@/database/knex";

class TableController
{
    async index(request: Request, response: Response, next: NextFunction)
    {
        try
        {
            const tables = await knex<TableRepository>("tables").orderBy("table_number");
            
            response.json(tables);
            return;
        }
        catch (error)
        {
            next(error);
        }
    }
}

export { TableController };