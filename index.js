const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const pool = require('./db'); // Importa la conexión a la base de datos
const { check, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: 'http://localhost:4000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

app.use(helmet());
app.use(bodyParser.json());

// Ruta para la raíz
app.get('/', (req, res) => {
    res.send('<h1>Bienvenido a la API de bdsql</h1><p>Este es un ejemplo de respuesta desde la raíz.</p>');
});

// Crear las tablas si no existen
const crearTablas = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS alertas (
            id SERIAL PRIMARY KEY,
            tipo VARCHAR(50) NOT NULL
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS datos_personales (
            id SERIAL PRIMARY KEY,
            edad INTEGER NOT NULL,
            sexo VARCHAR(10) NOT NULL,
            emocion VARCHAR(50) NOT NULL
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicular (
            id SERIAL PRIMARY KEY,
            tipo VARCHAR(50) NOT NULL,
            descripcion TEXT NOT NULL,
            fecha VARCHAR(20) NOT NULL,
            ubicacion VARCHAR(100) NOT NULL
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS camaras (
            id SERIAL PRIMARY KEY,
            numero VARCHAR(50) NOT NULL,
            direccion VARCHAR(100) NOT NULL,
            tipo VARCHAR(50) NOT NULL,
            ubicacion VARCHAR(100) NOT NULL,
            resolucion VARCHAR(50) NOT NULL
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
    check('ubicacion').notEmpty().withMessage('Ubicación es requerida'),
    check('placas').notEmpty().withMessage('Placas son requeridas')  // Validación para las placas
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { tipo, descripcion, fecha, ubicacion, placas } = req.body;  // Incluir placas
        const nuevoVehicular = await pool.query(
            'INSERT INTO vehicular (tipo, descripcion, fecha, ubicacion, placas) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [tipo, descripcion, fecha, ubicacion, placas]  // Incluir placas en la consulta
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


// Rutas para Cámaras
app.post('/camara', [
    check('numero').notEmpty().withMessage('Número de cámara es requerido'),
    check('direccion').notEmpty().withMessage('Dirección es requerida'),
    check('tipo').notEmpty().withMessage('Tipo es requerido'),
    check('ubicacion').notEmpty().withMessage('Ubicación es requerida'),
    check('resolucion').notEmpty().withMessage('Resolución es requerida'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { numero, direccion, tipo, ubicacion, resolucion } = req.body;
        const nuevaCamara = await pool.query(
            'INSERT INTO camaras (numero, direccion, tipo, ubicacion, resolucion) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [numero, direccion, tipo, ubicacion, resolucion]
        );
        res.status(201).json(nuevaCamara.rows[0]);
    } catch (err) {
        console.error('Error inserting camara:', err);
        res.status(500).send('Server Error');
    }
});

app.get('/camaras', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM camaras');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching camaras:', err);
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
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
