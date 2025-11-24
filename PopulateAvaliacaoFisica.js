import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 30;   
const chunk = 1000;   

function gerarAvaliacao() {
    const altura = faker.number.float({ min: 1.40, max: 2.00, precision: 0.01 });
    const peso = faker.number.float({ min: 50, max: 120, precision: 0.1 });
    const imc = Number((peso / (altura * altura)).toFixed(2));
    const gordura = faker.number.float({ min: 10, max: 35, precision: 0.1 });

    return [
        faker.date.recent().toISOString().slice(0, 19).replace("T", " "),
       faker.helpers.arrayElement([  
            "Ok",
            "Avaliação inicial",
            "Boa evolução",
            "Precisa melhorar"
        ]),        altura,
        peso,
        imc,
        gordura
    ];
}

async function popular() {
    const conn = await getConnection();
    console.log("Conectando ao banco...");

    await conn.beginTransaction();
    console.log("Iniciando a população de Avaliação Física...");

    try {
        for (let i = 0; i < total; i += chunk) {

            const valores = [];
            const fim = Math.min(i + chunk, total);

            for (let j = i; j < fim; j++) {
                valores.push(gerarAvaliacao());
            }

            const placeholders = valores
                .map(() => "(?, ?, ?, ?, ?, ?)")
                .join(", ");

            const flat = valores.flat();

            await conn.query(
                `
                INSERT INTO AvaliacaoFisica 
                (data_avaliacao, observacoes, altura, peso, imc, percentual_gordura)
                VALUES ${placeholders}
                `,
                flat
            );

            console.log(`Inseridos ${fim} de ${total} registros de Avaliação Física`);
        }

        await conn.commit();
        console.log("População de Avaliação Física finalizada!");

    } catch (error) {
        console.error("Erro ao popular Avaliação Física:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popular();
