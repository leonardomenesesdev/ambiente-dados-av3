import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 30;   // quantidade desejada
const chunk = 1000; // lotes grandes (mantido do seu exemplo)

function gerarAula() {
    return [
       faker.helpers.arrayElement([  // objetivo
            "Aula de Boxe",
            "Aula de Yoga",
            "Aula de Jiu-Jitsu",
            "Aula de Beach Tennis",
            "Aula de Crossfit"
        ]),        faker.lorem.sentence(5), // descricao
        faker.number.int({ min: 1, max: 5 }), // nível
        faker.number.int({ min: 10, max: 40 }), // capacidade
        faker.location.streetAddress(), // local da aula
        faker.date.soon().toISOString().slice(11, 19), // hora_inicio (HH:MM:SS)
        faker.number.int({ min: 30, max: 90 }) // duração em minutos
    ];
}

async function popular() {
    const conn = await getConnection();
    console.log("Conectando ao banco...");

    await conn.beginTransaction();
    console.log("Iniciando a população de Aula...");

    try {
        for (let i = 0; i < total; i += chunk) {

            const valores = [];
            const fim = Math.min(i + chunk, total);

            for (let j = i; j < fim; j++) {
                valores.push(gerarAula());
            }

            const placeholders = valores
                .map(() => "(?, ?, ?, ?, ?, ?, ?)")
                .join(", ");
            const flat = valores.flat();

            await conn.query(
                `
                INSERT INTO Aula 
                (nome, descricao, nivel_dificuldade, capacidade_maxima, local_aula, hora_inicio, duracao)
                VALUES ${placeholders}
                `,
                flat
            );

            console.log(`Inseridas ${fim} de ${total} aulas`);
        }

        await conn.commit();
        console.log("População de Aula finalizada com sucesso.");

    } catch (error) {
        console.error("Erro ao popular Aula:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popular();
