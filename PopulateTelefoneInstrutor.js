import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 30;

function gerarTelefone() {
    // formato seguro com no máximo 15 caracteres
    return faker.string.numeric(11); // ex: 11987654321
}

async function popular() {
    const conn = await getConnection();
    console.log("Conectando ao banco...");

    await conn.beginTransaction();
    console.log("Carregando IDs reais dos instrutores...");

    try {
        const [rows] = await conn.query("SELECT id_instrutor FROM Instrutor");
        const ids = rows.map(r => r.id_instrutor);

        if (ids.length === 0) {
            throw new Error("Nenhum instrutor encontrado.");
        }

        console.log(`Foram encontrados ${ids.length} instrutores (IDs reais).`);

        console.log("Populando Telefone_Instrutor...");

        const valores = [];

        for (let i = 0; i < total; i++) {
            valores.push([
                gerarTelefone(),
                faker.helpers.arrayElement(ids) // FK válida
            ]);
        }

        const placeholders = valores.map(() => "(?, ?)").join(", ");
        const flat = valores.flat();

        await conn.query(`
            INSERT INTO Telefone_Instrutor (telefone, id_instrutor)
            VALUES ${placeholders}
        `, flat);

        await conn.commit();
        console.log("População de Telefone_Instrutor finalizada!");

    } catch (error) {
        console.error("Erro ao popular Telefone_Instrutor:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popular();
