import { getConnection } from "./db.js";
import mysql from "mysql2/promise";

const TOTAL = 10_000_000;   // 10 milhões
const CHUNK = 5000;         // Valor SEGURO


function gerarEquipamento(i) {
  return [
    `Equipamento_${i % 100}`,   // nome repetido (super rápido)
    "OK",                       // estado fixo
    "2020-01-01 00:00:00",      // data fixa
    "Categoria_A"               // categoria fixa
  ];
}

async function popular() {
  const conn = await getConnection();

  console.log("Conectado. Iniciando transação...");
  await conn.beginTransaction();

  try {
    for (let i = 0; i < TOTAL; i += CHUNK) {
      const valores = [];

      for (let j = i; j < i + CHUNK && j < TOTAL; j++) {
        valores.push(gerarEquipamento(j));
      }

      const placeholders = valores.map(() => "(?, ?, ?, ?)").join(",");
      const flat = valores.flat();

      await conn.query(
        `INSERT INTO Equipamento (nome, estado, data_aquisicao, categoria)
         VALUES ${placeholders}`,
        flat
      );

      if (i % 100000 === 0) {
        console.log(`[${((i / TOTAL) * 100).toFixed(2)}%] Inseridos: ${i}`);
      }
    }

    await conn.commit();
    console.log("✔ Finalizado! 10 milhões inseridos.");
  } catch (err) {
    console.error("Erro:", err);
    await conn.rollback();
  } finally {
    conn.end();
  }
}

popular();
