//nao sei se vdc

import { getConnection } from "./db.js";
import { faker } from "@faker-js/faker";

async function carregarIds(conn, tabela, coluna) {
    const [rows] = await conn.query(`SELECT ${coluna} FROM ${tabela}`);
    return rows.map(r => r[coluna]);
}

function gerarPares(idsA, idsB, total) {
    const pares = [];
    const usados = new Set();

    while (pares.length < total) {
        const idA = faker.helpers.arrayElement(idsA);
        const idB = faker.helpers.arrayElement(idsB);

        const chave = `${idA}-${idB}`;
        if (usados.has(chave)) continue;

        usados.add(chave);
        pares.push([idA, idB]);
    }

    return pares;
}

async function inserirRelacionamento(conn, tabela, colA, colB, pares) {
    const placeholders = pares.map(() => `(?, ?)`).join(", ");
    const flat = pares.flat();

    await conn.query(`
        INSERT INTO ${tabela} (${colA}, ${colB})
        VALUES ${placeholders}
    `, flat);
}

async function popularRelacionamentos() {
    const conn = await getConnection();
    await conn.beginTransaction();

    try {
        console.log("Carregando IDs existentes...");

        const idsAluno = await carregarIds(conn, "Aluno", "id_aluno");
        const idsAula = await carregarIds(conn, "Aula", "id_aula");
        const idsAvaliacao = await carregarIds(conn, "AvaliacaoFisica", "id_avaliacao");
        const idsInstrutor = await carregarIds(conn, "Instrutor", "id_instrutor");
        const idsExercicio = await carregarIds(conn, "Exercicio", "id_exercicio");
        const idsTreino = await carregarIds(conn, "Treino", "id_treino");
        const idsFicha = await carregarIds(conn, "FichaTreino", "id_ficha");
        const idsPlano = await carregarIds(conn, "PlanoMensal", "id_plano");
        const idsPagamento = await carregarIds(conn, "Pagamento", "id_pagamento");
        const idsEquip = await carregarIds(conn, "Equipamento", "id_equipamento");

        console.log("Inserindo relacionamentos...");

        await inserirRelacionamento(conn, "Aluno_Aula", "id_aluno", "id_aula",
            gerarPares(idsAluno, idsAula, 30));

        await inserirRelacionamento(conn, "AvaliacaoFisica_Aluno", "id_avaliacao", "id_aluno",
            gerarPares(idsAvaliacao, idsAluno, 30));

        await inserirRelacionamento(conn, "AvaliacaoFisica_Instrutor", "id_avaliacao", "id_instrutor",
            gerarPares(idsAvaliacao, idsInstrutor, 30));

        await inserirRelacionamento(conn, "Exercicio_Treino", "id_exercicio", "id_treino",
            gerarPares(idsExercicio, idsTreino, 30));

        await inserirRelacionamento(conn, "Exercicio_Equipamento", "id_exercicio", "id_equipamento",
            gerarPares(idsExercicio, idsEquip, 30));

        await inserirRelacionamento(conn, "FichaTreino_Treino", "id_ficha", "id_treino",
            gerarPares(idsFicha, idsTreino, 30));


        await conn.commit();
        console.log("Relacionamentos inseridos com sucesso!");

    } catch (error) {
        console.error("Erro ao popular relacionamentos:", error);
        await conn.rollback();
    } finally {
        await conn.end();
    }
}

popularRelacionamentos();
