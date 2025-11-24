import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

const total = 30;
const chunk = 1000;

const listaExercicios = [
  "Supino Reto",
  "Supino Inclinado",
  "Crucifixo",
  "Crossover",
  "Flexão de Braço",
  "Peck Deck",
  "Puxada Alta",
  "Remada Curvada",
  "Remada Baixa",
  "Barra Fixa",
  "Serrote",
  "Pulldown",
  "Agachamento Livre",
  "Leg Press 45º",
  "Cadeira Extensora",
  "Mesa Flexora",
  "Stiff",
  "Afundo",
  "Elevação Pélvica",
  "Panturrilha no Smith",
  "Desenvolvimento",
  "Elevação Lateral",
  "Elevação Frontal",
  "Face Pull",
  "Rosca Direta",
  "Rosca Martelo",
  "Rosca Scott",
  "Tríceps Polia",
  "Tríceps Testa",
  "Tríceps Francês",
];

const listaGruposMusculares = [
  "Peitoral",
  "Dorsais",
  "Deltoides",
  "Trapézio",
  "Bíceps",
  "Tríceps",
  "Antebraços",
  "Abdominais",
  "Oblíquos",
  "Lombar",
  "Quadríceps",
  "Isquiotibiais",
  "Glúteos",
  "Adutores",
  "Panturrilhas",
];

function gerarExercicio() {
    return [
      faker.helpers.arrayElement(listaExercicios),
      faker.helpers.arrayElement(listaGruposMusculares),
      faker.helpers.arrayElement(listaGruposMusculares),
      faker.word.words({ count: {min: 5, max: 50 }})
    ];
}

async function popular() {
    const conn = await getConnection();
    console.log("Conectando ao banco");

    await conn.beginTransaction();
    console.log('Iniciando a populaçao de execicios');

    try {
        for (let i = 0; i < total; i += chunk) {

            const valores = [];
            const fim = Math.min(i + chunk, total);

            for (let j = i; j < fim; j++) {
                valores.push(gerarExercicio());
            }

        
            const placeholders = valores.map(() => '(?, ?, ?, ?)').join(', ');
            const flat = valores.flat();

            await conn.query(
              `
                INSERT INTO Exercicio 
                (nome, grupo_muscular_principal, grupo_muscular_secundario, descricao)
                VALUES ${placeholders}
            `,
              flat
            );

            console.log(`Inseridos ${fim} de ${total} exercicos`);
        }

        await conn.commit();
        console.log("População de exercicios finalizada");

    } catch (error) {
        console.error("Erro ao popular exercicios:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popular();