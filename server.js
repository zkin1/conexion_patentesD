const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Conexión a MongoDB Atlas
const mongoURI = 'mongodb://zkn:zkn1322@ac-b8lk0cs-shard-00-00.36avb4f.mongodb.net:27017,ac-b8lk0cs-shard-00-01.36avb4f.mongodb.net:27017,ac-b8lk0cs-shard-00-02.36avb4f.mongodb.net:27017/patentesD?replicaSet=atlas-6hvucv-shard-0&ssl=true&authSource=admin';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error al conectar a MongoDB Atlas', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conexión establecida con MongoDB Atlas');
});

// Esquema y modelo de usuario
const usuarioSchema = new mongoose.Schema({
  nombre: String,
  contraseña: String,
  numeroPatente: String,
  numeroTelefono: String,
  correoInstitucional: String
}, { collection: 'usuarios' });

const Usuario = mongoose.model('Usuario', usuarioSchema, 'usuarios');

// Esquema y modelo para consultasRegistradas (actualizado)
const consultaSchema = new mongoose.Schema({
  correoUsuario: String,
  numeroPatente: String,
  fechaConsulta: { type: Date, default: Date.now }
}, { collection: 'consultasRegistradas' });

const ConsultaRegistrada = mongoose.model('ConsultaRegistrada', consultaSchema, 'consultasRegistradas');

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find({}).maxTimeMS(10000);
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para registrar un nuevo usuario
app.post('/usuarios', async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    const usuarioGuardado = await nuevoUsuario.save();
    res.status(201).json(usuarioGuardado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para registrar una consulta (actualizada)
app.post('/consultasRegistradas', async (req, res) => {
  try {
    const { correoUsuario, numeroPatente } = req.body;
    const nuevaConsulta = new ConsultaRegistrada({
      correoUsuario,
      numeroPatente
      // fechaConsulta se agregará automáticamente
    });

    const consultaGuardada = await nuevaConsulta.save();
    res.status(201).json(consultaGuardada);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para obtener todas las consultas registradas
app.get('/consultasRegistradas', async (req, res) => {
  try {
    const consultas = await ConsultaRegistrada.find();
    res.json(consultas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Ruta para buscar un usuario por número de patente
app.get('/buscarPorPatente/:numeroPatente', async (req, res) => {
  const numeroPatente = req.params.numeroPatente;
  try {
    const usuarioEncontrado = await Usuario.findOne({ numeroPatente });

    if (usuarioEncontrado) {
      res.json(usuarioEncontrado);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});