const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const mongoURI = 'mongodb://zkn:password@ac-b8lk0cs-shard-00-00.36avb4f.mongodb.net:27017,ac-b8lk0cs-shard-00-01.36avb4f.mongodb.net:27017,ac-b8lk0cs-shard-00-02.36avb4f.mongodb.net:27017/patentesD?replicaSet=atlas-6hvucv-shard-0&ssl=true&authSource=admin';

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
}, { collection: 'usuarios' }); // Especifica la colección en la base de datos

const Usuario = mongoose.model('Usuario', usuarioSchema, 'usuarios'); 

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
    const nuevoUsuario = new Usuario({
      nombre: req.body.nombre,
      contraseña: req.body.contraseña,
      numeroPatente: req.body.numeroPatente,
      numeroTelefono: req.body.numeroTelefono,
      correoInstitucional: req.body.correoInstitucional
    });

    const usuarioGuardado = await nuevoUsuario.save();
    res.status(201).json(usuarioGuardado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
