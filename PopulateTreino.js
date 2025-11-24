import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 30;     // quantidade de treinos
const chunk = 1000;   // processamento por lote

function gerarTreino() {
    return [
        faker.word.words(2),          // nome
        faker.helpers.arrayElement([  // objetivo
            "Hipertrofia",
            "Emagrecimento",
            "Resistência",
            "Força",
            "Condicionamento"
        ])
    ];
}

async function popular() {
    const conn = await getConnection();
    console.log("Conectando ao banco...");

    await conn.beginTransaction();
    console.log("Iniciando população de Treino...");

    try {
        for (let i = 0; i < total; i += chunk) {

            const valores = [];
            const fim = Math.min(i + chunk, total);

            for (let j = i; j < fim; j++) {
                valores.push(gerarTreino());
            }

            const placeholders = valores.map(() => "(?, ?)").join(", ");
            const flat = valores.flat();

            await conn.query(
                `
                INSERT INTO Treino (nome, objetivo)
                VALUES ${placeholders}
                `,
                flat
            );

            console.log(`Inseridos ${fim} de ${total} treinos`);
        }

        await conn.commit();
        console.log("População de Treino finalizada!");
    } catch (error) {
        console.error("Erro ao popular Treino:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popular();
