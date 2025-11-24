import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 30;
const chunk = 1000;

function gerarAluno() {
    return [
        faker.person.fullName(),
        faker.string.numeric({ length: 11, allowLeadingZeros: true }), 
        faker.internet.email(),
        faker.location.street(),
        faker.location.city(),
        faker.string.numeric({ length: 4 }),
        faker.date.birthdate({ min: 1940, max: 2010 }).toISOString().slice(0, 10),
        faker.date.recent().toISOString().slice(0, 19).replace('T', ' ')
    ];
}

async function popular() {
    const conn = await getConnection();
    console.log("Conectando ao banco");

    await conn.beginTransaction();
    console.log('Iniciando a populaçao de alunos');

    try {
        for (let i = 0; i < total; i += chunk) {

            const valores = [];
            const fim = Math.min(i + chunk, total);

            for (let j = i; j < fim; j++) {
                valores.push(gerarAluno());
            }

            // Agora sim: um único INSERT por chunk
            const placeholders = valores.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
            const flat = valores.flat();

            await conn.query(`
                INSERT INTO Aluno 
                (nome, cpf, email, logradouro, bairro, numero, data_nascimento, data_cadastro)
                VALUES ${placeholders}
            `, flat);

            console.log(`Inseridos ${fim} de ${total} alunos`);
        }

        await conn.commit();
        console.log("População de alunos finalizada");

    } catch (error) {
        console.error("Erro ao popular alunos:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popular();
