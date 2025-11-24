import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 30;   
const chunk = 1000; 

function gerarAula() {
    return [
       faker.helpers.arrayElement([  
            "Aula de Boxe",
            "Aula de Yoga",
            "Aula de Jiu-Jitsu",
            "Aula de Beach Tennis",
            "Aula de Crossfit"
        ]),        faker.lorem.sentence(5), 
        faker.number.int({ min: 1, max: 5 }), 
        faker.number.int({ min: 10, max: 40 }),
        faker.location.streetAddress(), 
        faker.date.soon().toISOString().slice(11, 19),
        faker.number.int({ min: 30, max: 90 })
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
