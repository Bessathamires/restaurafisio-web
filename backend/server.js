require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Conexão com PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Testar conexão com o banco
app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');

    res.send('RestauraFisio+ conectado ao PostgreSQL!');
  } catch (error) {
    console.error('Erro na conexão:', error.message);
    res.status(500).send('Erro ao conectar ao banco de dados.');
  }
});
// Registrar evolução fisioterapêutica
app.post('/evolucoes', async (req, res) => {
  const {
    paciente_id,
    data_atendimento,
    profissional,
    condicao_clinica,
    condutas,
    resposta_tratamento,
    intercorrencias,
    observacoes
  } = req.body;

  if (
    !Number.isInteger(paciente_id) ||
    !data_atendimento ||
    !profissional?.trim() ||
    !condicao_clinica?.trim() ||
    !condutas?.trim() ||
    !resposta_tratamento?.trim()
  ) {
    return res.status(400).json({
      erro: 'Preencha todos os campos obrigatórios.'
    });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO evolucoes
       (paciente_id, data_atendimento, profissional,
        condicao_clinica, condutas, resposta_tratamento,
        intercorrencias, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        paciente_id,
        data_atendimento,
        profissional,
        condicao_clinica,
        condutas,
        resposta_tratamento,
        intercorrencias || null,
        observacoes || null
      ]
    );

    res.status(201).json({
      mensagem: 'Evolução registrada com sucesso!',
      id: resultado.rows[0].id
    });
  } catch (error) {
    console.error('Erro ao registrar evolução:', error.message);
    res.status(500).json({
      erro: 'Não foi possível registrar a evolução.'
    });
  }
});
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});