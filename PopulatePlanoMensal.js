import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 30;
const chunk = 1000;

//casos pre criados
const case1 = ["Individual", 20.90, faker.number.int({ min: 1, max: 60 }), "Plano Individual"];
const case2 = ["Dupla", 40.90, faker.number.int({ min: 1, max: 60 }), "Plano Dupla"];
const case3 = ["Familia", 60.90, faker.number.int({ min: 1, max: 60 }), "Plano Familia"];


function escolherCase() {
    return faker.helpers.arrayElement([case1, case2, case3]);
}

async function popular() {
    const conn = await getConnection();
    console.log("Conectando ao banco...");

    await conn.beginTransaction();
    console.log("Iniciando população de PlanoMensal...");

    try {
        for (let i = 0; i < total; i += chunk) {

            const valores = [];
            const fim = Math.min(i + chunk, total);

            for (let j = i; j < fim; j++) {
                valores.push(escolherCase()); 
            }

            const placeholders = valores.map(() => "(?, ?, ?, ?)").join(", ");
            const flat = valores.flat();

            await conn.query(
                `
                INSERT INTO PlanoMensal 
                (nome, valor, duracao_meses, descricao)
                VALUES ${placeholders}
                `,
                flat
            );

            console.log(`Inseridos ${fim} de ${total}`);
        }

        await conn.commit();
        console.log("População de PlanoMensal finalizada!");

    } catch (error) {
        console.error("Erro ao popular PlanoMensal:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popular();
