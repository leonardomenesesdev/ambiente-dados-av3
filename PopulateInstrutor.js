import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 30;
const chunk = 1000;

function gerarInstrutor() {
    return [
        faker.person.firstName(),
        faker.person.lastName(),
        faker.string.numeric({ length: 11, allowLeadingZeros: true }), 
       faker.helpers.arrayElement([  
            "Boxe",
            "Yoga",
            "Jiu-Jitsu",
            "Beach Tennis",
            "Crossfit"
        ]),
        faker.internet.email(),
        faker.date.recent().toISOString().slice(0, 19).replace('T', ' ')
    ];
}

async function popular() {
    const conn = await getConnection();
    console.log("Conectando ao banco");

    await conn.beginTransaction();
    console.log('Iniciando a populaçao de instrutores');

    try {
        for (let i = 0; i < total; i += chunk) {

            const valores = [];
            const fim = Math.min(i + chunk, total);

            for (let j = i; j < fim; j++) {
                valores.push(gerarInstrutor());
            }


            const placeholders = valores.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
            const flat = valores.flat();

            await conn.query(`
                INSERT INTO Instrutor 
                (nome, sobrenome, cpf, especialidade, email, data_contratacao)
                VALUES ${placeholders}
            `, flat);

            console.log(`Inseridos ${fim} de ${total} instrutores`);
        }

        await conn.commit();
        console.log("População de instrutores finalizada");

    } catch (error) {
        console.error("Erro ao popular instrutores:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popular();