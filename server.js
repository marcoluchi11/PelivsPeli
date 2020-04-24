var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var controlador = require('./controladores/CompetenciasController')
var app = express();
app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));
/*ALTER DATABASE competencias CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE actor CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
*/  
app.use(bodyParser.json());
app.get('/competencias',controlador.buscarCompetencias);
app.get('/generos',controlador.agregarGeneros)
app.get('/directores',controlador.agregarDirectores);
app.get('/actores',controlador.agregarActores);
app.post('/competencias',controlador.crearCompetencia);
app.delete('/competencias/:id',controlador.eliminarCompetencia);
app.put('/competencias/:id',controlador.editarCompetencia)
app.get('/competencias/:id/peliculas',controlador.obtenerOpciones);
app.post('/competencias/:id/voto',controlador.agregarVoto);
app.get('/competencias/:id/resultados',controlador.mostrarResultados);
app.delete('/competencias/:id/votos',controlador.reiniciarVotos);
var puerto = '8080';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});