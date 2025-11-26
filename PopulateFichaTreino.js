import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 30;
const chunk = 1000;

function gerarFichaTreino(idAluno) {
    return [
        faker.person.firstName(),  
        idAluno                     
    ];
}

async function popular() {
    const conn = await getConnection();
    console.log("Conectando ao banco");

    await conn.beginTransaction();
    console.log("Carregando IDs reais dos alunos...");

    try {
        const [rows] = await conn.query("SELECT id_aluno FROM Aluno");
        const alunos = rows.map(r => r.id_aluno);

        if (alunos.length === 0) {
            throw new Error("Nenhum aluno encontrado!");
        }

        console.log(`Foram encontrados ${alunos.length} alunos (IDs reais).`);
        console.log("Iniciando a população de fichas de treino...");

        for (let i = 0; i < total; i += chunk) {

            const valores = [];
            const fim = Math.min(i + chunk, total);

            for (let j = i; j < fim; j++) {
                valores.push(
                    gerarFichaTreino(
                        faker.helpers.arrayElement(alunos) 
                    )
                );
            }

            const placeholders = valores.map(() => '(?, ?)').join(', ');
            const flat = valores.flat();

            await conn.query(
                `
                INSERT INTO FichaTreino 
                (titulo, id_aluno)
                VALUES ${placeholders}
            `,
                flat
            );

            console.log(`Inseridos ${fim} de ${total} fichas de treino`);
        }

        await conn.commit();
        console.log("População de fichas de treino finalizada!");

    } catch (error) {
        console.error("Erro ao popular ficha de treino:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popular();
