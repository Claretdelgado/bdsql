const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const pool = require('./db'); // Importa la conexión a la base de datos
const { check, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

app.use(helmet());
app.use(bodyParser.json());

// Crear las tablas si no existen
const crearTablas = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS alertas (
            id SERIAL PRIMARY KEY,
            tipo VARCHAR(50)
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS datos_personales (
            id SERIAL PRIMARY KEY,
            edad INTEGER,
            sexo VARCHAR(10),
            emocion VARCHAR(50)
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicular (
            id SERIAL PRIMARY KEY,
            tipo VARCHAR(50),
            descripcion TEXT,
            fecha VARCHAR(20),
            ubicacion VARCHAR(100)
        )
    `);
};

// Crear las tablas al iniciar el servidor
crearTablas().catch(err => console.error('Error creating tables:', err));

// Rutas para Alerta
app.post('/alerta', [
    check('tipo').notEmpty().withMessage('Tipo es requerido')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { tipo } = req.body;
        const nuevaAlerta = await pool.query(
            'INSERT INTO alertas (tipo) VALUES ($1) RETURNING *',
            [tipo]
        );
        res.status(201).json(nuevaAlerta.rows[0]);
    } catch (err) {
        console.error('Error inserting alerta:', err);
        res.status(500).send('Server Error');
    }
});

app.get('/alertas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alertas');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching alertas:', err);
        res.status(500).send('Server Error');
    }
});

// Rutas para Datos Personales
app.post('/datos_personales', [
    check('edad').isInt({ min: 0 }).withMessage('Edad debe ser un número positivo'),
    check('sexo').notEmpty().withMessage('Sexo es requerido'),
    check('emocion').notEmpty().withMessage('Emoción es requerida')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { edad, sexo, emocion } = req.body;
        const nuevoDato = await pool.query(
            'INSERT INTO datos_personales (edad, sexo, emocion) VALUES ($1, $2, $3) RETURNING *',
            [edad, sexo, emocion]
        );
        res.status(201).json(nuevoDato.rows[0]);
    } catch (err) {
        console.error('Error inserting datos personales:', err);
        res.status(500).send('Server Error');
    }
});

app.get('/datos_personales', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM datos_personales');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching datos personales:', err);
        res.status(500).send('Server Error');
    }
});

// Rutas para Vehicular
app.post('/vehicular', [
    check('tipo').notEmpty().withMessage('Tipo es requerido'),
    check('descripcion').notEmpty().withMessage('Descripción es requerida'),
    check('fecha').notEmpty().withMessage('Fecha es requerida'),
    check('ubicacion').notEmpty().withMessage('Ubicación es requerida')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { tipo, descripcion, fecha, ubicacion } = req.body;
        const nuevoVehicular = await pool.query(
            'INSERT INTO vehicular (tipo, descripcion, fecha, ubicacion) VALUES ($1, $2, $3, $4) RETURNING *',
            [tipo, descripcion, fecha, ubicacion]
        );
        res.status(201).json(nuevoVehicular.rows[0]);
    } catch (err) {
        console.error('Error inserting vehicular:', err);
        res.status(500).send('Server Error');
    }
});

app.get('/vehiculares', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vehicular');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching vehiculares:', err);
        res.status(500).send('Server Error');
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
