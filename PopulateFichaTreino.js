import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 30;
const chunk = 1000;

function gerarFichaTreino() {
    return [
      faker.person.firstName()
    ];
}

async function popular() {
    const conn = await getConnection();
    console.log("Conectando ao banco");

    await conn.beginTransaction();
    console.log('Iniciando a populaçao de fichas de treino');

    try {
        for (let i = 0; i < total; i += chunk) {

            const valores = [];
            const fim = Math.min(i + chunk, total);

            for (let j = i; j < fim; j++) {
                valores.push(gerarFichaTreino());
            }

            // Agora sim: um único INSERT por chunk
            const placeholders = valores.map(() => '(?)').join(', ');
            const flat = valores.flat();

            await conn.query(
              `
                INSERT INTO FichaTreino 
                (titulo)
                VALUES ${placeholders}
            `,
              flat
            );

            console.log(`Inseridos ${fim} de ${total} fichas de treino`);
        }

        await conn.commit();
        console.log("População de fichas de treino finalizada");

    } catch (error) {
        console.error("Erro ao popular ficha de treino:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popular();