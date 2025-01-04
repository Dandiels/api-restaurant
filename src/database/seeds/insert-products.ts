import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void>
{
    await knex<ProductRepository>("products").insert
    ([
        { name: "Nhoque Quatro Queijos", price: 45 },
        { name: "Isca de Frango", price: 60 },
        { name: "Tilápia com Alcaparras", price: 100 },
        { name: "Bolinho de Mandioca", price: 75 },
        { name: "Escondidinho de Carne de Sol", price: 65 },
        { name: "Porção de Batatas Fritas", price: 40 },
        { name: "Executivo de Frango Grelhado", price: 36 },
        { name: "Executivo de Tilápia Grelhada", price: 39 },
        { name: "Caldo de Palmito", price: 30 },
        { name: "Refrigerante 350mL", price: 7.5 },
        { name: "Suco de Laranja 440mL", price: 10 }
    ]);
}