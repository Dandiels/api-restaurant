import { Request, Response, NextFunction } from "express";
import { knex } from "@/database/knex";
import { AppError } from "@/utils/AppError";
import { z } from "zod";

class ProductController
{
    async index(request: Request, response: Response, next: NextFunction)
    {
        try
        {
            const { name } = request.query;
            const products = await knex<ProductRepository>("products").whereLike("name", `%${ name ?? "" }%`).orderBy("name");
            
            response.json(products);
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
                name: z.string({ required_error: "Name is required." }).trim().min(6, { message: "Name must be at least 6 characters." }),
                price: z.number({ required_error: "Price is required." }).gt(0, { message: "Price must be greater than 0." })
            });

            const { name, price } = bodySchema.parse(request.body);

            await knex<ProductRepository>("products").insert({ name, price });
            
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

            const product = await knex<ProductRepository>("products").where({ id }).first();

            if (!product)
            {
                throw new AppError("Product not found.", 404);
            }
            
            const bodySchema = z.object
            ({
                name: z.string({ required_error: "Name is required." }).trim().min(6, { message: "Name must be at least 6 characters." }),
                price: z.number({ required_error: "Price is required." }).gt(0, { message: "Price must be greater than 0." })
            });

            const { name, price } = bodySchema.parse(request.body);

            await knex<ProductRepository>("products").update({ name, price, updated_at: knex.fn.now() }).where({ id });
            
            response.json();
            return;
        }
        catch (error)
        {
            next(error);
        }
    }

    async remove(request: Request, response: Response, next: NextFunction)
    {
        try
        {
            const id = z.string()
            .transform((value) => Number(value))
            .refine((value) => !isNaN(value), { message: "ID must be a number." })
            .refine((value) => value > 0, { message: "ID must be greater than 0." })
            .parse(request.params.id);

            const product = await knex<ProductRepository>("products").where({ id }).first();

            if (!product)
            {
                throw new AppError("Product not found.", 404);
            }
            
            await knex<ProductRepository>("products").delete().where({ id });
            
            response.json();
            return;
        }
        catch (error)
        {
            next(error);
        }
    }
}

export { ProductController };