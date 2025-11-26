import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 30;

function gerarTelefone() {
    return faker.string.numeric(11); // ex: 11987654321
}

async function popular() {
    const conn = await getConnection();
    console.log("Conectando ao banco...");

    await conn.beginTransaction();
    console.log("Carregando IDs reais dos alunos...");

    try {
        const [rows] = await conn.query("SELECT id_aluno FROM Aluno");
        const ids = rows.map(r => r.id_aluno);

        if (ids.length === 0) {
            throw new Error("Nenhum aluno encontrado.");
        }

        console.log(`Foram encontrados ${ids.length} alunos (IDs reais).`);

        console.log("Populando Telefone_Aluno...");

        const valores = [];

        for (let i = 0; i < total; i++) {
            valores.push([
                gerarTelefone(),
                faker.helpers.arrayElement(ids) // 💥 garante FK válida
            ]);
        }

        const placeholders = valores.map(() => "(?, ?)").join(", ");
        const flat = valores.flat();

        await conn.query(`
            INSERT INTO Telefone_Aluno (telefone, id_aluno)
            VALUES ${placeholders}
        `, flat);

        await conn.commit();
        console.log("População de Telefone_Aluno finalizada!");

    } catch (error) {
        console.error("Erro ao popular Telefone_Aluno:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popular();
