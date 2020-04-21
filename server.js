var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var controlador = require('./controladores/CompetenciasController')
var app = express();
app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.get('/competencias',controlador.buscarCompetencias);
app.get('/generos',controlador.agregarGeneros)
app.post('/competencias',controlador.crearCompetencia);

app.get('/competencias/:id/peliculas',controlador.obtenerOpciones);
app.post('/competencias/:id/voto',controlador.agregarVoto);
app.get('/competencias/:id/resultados',controlador.mostrarResultados);
app.delete('/competencias/:id/votos',controlador.reiniciarVotos);
var puerto = '8080';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});