import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 50;
const chunk = 1000;

const metodos = ["dinheiro", "pix", "cartao"];

function escolherMetodo() {
    return faker.helpers.arrayElement(metodos);
}

// Recebe um array de ids válidos e sorteia um
function escolherPlano(idsPlano) {
    return faker.helpers.arrayElement(idsPlano);
}

function gerarPagamento(idPlano) {
    return [
        faker.helpers.arrayElement([20.90, 40.90, 60.90]),                   
        faker.date.recent().toISOString().slice(0, 19).replace("T", " "),   
        faker.helpers.arrayElement(["pago", "pendente", "cancelado"]),      
        escolherMetodo(),
        idPlano                     // agora inclui id_plano
    ];
}

async function popular() {
    const conn = await getConnection();
    console.log("Conectando ao banco");

    try {
        // 🔥 Buscar todos os IDs de plano existentes
        const [rows] = await conn.query("SELECT id_plano FROM PlanoMensal");
        const idsPlano = rows.map(r => r.id_plano);

        if (idsPlano.length === 0) {
            throw new Error("Nenhum plano mensal encontrado no banco!");
        }

        await conn.beginTransaction();
        console.log("Iniciando a população de pagamentos");

        for (let i = 0; i < total; i += chunk) {

            const valores = [];
            const fim = Math.min(i + chunk, total);

            for (let j = i; j < fim; j++) {
                const plano = escolherPlano(idsPlano);
                valores.push(gerarPagamento(plano));
            }

            const placeholders = valores.map(() => '(?, ?, ?, ?, ?)').join(', ');
            const flat = valores.flat();

            await conn.query(`
                INSERT INTO Pagamento
                (valor, data_pagamento, status, metodo, id_plano)
                VALUES ${placeholders}
            `, flat);

            console.log(`Inseridos ${fim} de ${total} pagamentos`);
        }

        await conn.commit();
        console.log("População da tabela Pagamento finalizada!");

    } catch (error) {
        console.error("Erro ao popular pagamentos:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popular();
