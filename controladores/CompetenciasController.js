var con = require('../conexionBD');
var controller = {
    
    buscarCompetencias: function(req,res){

        var sql = 'select * from competencia'
        con.query(sql,function(error,resultado,fields){
            if(error){
                console.log('Hubo un error en la consulta', error.message);
                return res.status(404).send('hubo un error en la consulta');
            }
            res.send(JSON.stringify(resultado));
        })
     
     },
    obtenerOpciones: function(req,res){

            var id = req.params.id;
            //ID DE PELICULA, POSTER Y TITULO DE PELICULA
            var sql = 'select * from pelicula order by rand() limit 2;';
            var sql2 = 'select * from competencia where id = '+id;
            console.log(sql);
            console.log(sql2);
            con.query(sql,function(error,resultadoPeliculas,fields){
                if(error){
                    console.log('Hubo un error en la consulta', error.message);
                    return res.status(404).send('hubo un error en la consulta');
                }
                if(error) return res.status(500).json(error);
                con.query(sql2,function(error,resultadoCompetencia,fields){
                    if(error){
                        console.log('Hubo un error en la consulta', error.message);
                        return res.status(404).send('hubo un error en la consulta');
                    }

                    if(error) return res.status(500).json(error);
                    var respuesta = {
                        //FALTA HACER QUE APAREZCA EL NOMBRE DE LA COMPETENCIA
                        'id': resultadoCompetencia[0],
                        'peliculas':resultadoPeliculas,
                    }
                    console.log(resultadoPeliculas);
                    console.log(resultadoCompetencia[0]);
                    res.send(JSON.stringify(respuesta));
            });
        })
    },
    agregarVoto: function(req,res){

            var nuevoVoto = req.body;
            var idPelicula = nuevoVoto.idPelicula;
            var idCompetencia = req.params.id;
            con.query('INSERT INTO votos (pelicula_id,competencia_id) values (?,?)',[idPelicula, idCompetencia],function(error,results,fields){
                if(error){
                    console.log('Hubo un error en la consulta', error.message);
                    return res.status(404).send('hubo un error en la consulta');
                }
                if(error) return res.status(500).json(error);
                
                var response = {

                    'votos': results,
                }
                console.log(response);
                res.send(JSON.stringify(response));

            })

    },

    mostrarResultados: function(req,res){
            var id = req.params.id;
        var sql = 'select pelicula.id, pelicula.poster, pelicula.titulo, count(*) as votos from pelicula join votos on pelicula.id = votos.pelicula_id join competencia on competencia.id = votos.competencia_id where competencia.id = '+id+' group by pelicula.titulo order by votos desc limit 3';
        con.query(sql,function(error,results,fields){

            if(error){
                console.log('Hubo un error en la consulta', error.message);
                return res.status(404).send('hubo un error en la consulta');
            }
            if(error) return res.status(500).json(error);

            var response = {
                'resultados': results,
            }
            res.send(JSON.stringify(response));
        })

    },
    crearCompetencia: function(req,res){

                var request = req.body;
                var nuevaCompetencia = request.nombre;
                con.query('select nombre from competencia', function(error,resultadoCompetencia,fields){
                    for(var i=0;i<resultadoCompetencia.length;i++){
                        if(nuevaCompetencia === resultadoCompetencia[i].nombre){
                            return res.status(422).send('ya hay un nombre existente en la lista de competencias ')
                        }
                    }
                con.query('INSERT INTO competencia (nombre) values (?)',[nuevaCompetencia],function(error,results,fields){
                    
                    if(error){
                        console.log('Hubo un error en la consulta', error.message);
                        return res.status(404).send('hubo un error en la consulta');
                    }
                    if(error) return res.status(500).json(error);
                    res.send(JSON.stringify(results));
                })
            })
    },
    reiniciarVotos: function(req,res){

                var id = req.params.id;
                var sql = 'delete from votos where competencia_id = ' + id;
                console.log(sql);
                con.query(sql,function(error,results,fields){

                    if(error){
                        console.log('Hubo un error en la consulta', error.message);
                        return res.status(404).send('hubo un error en la consulta');
                    }
                    if(error) return res.status(500).json(error);
                    console.log('Se Reinicio la competencia con exito');
                    res.send(JSON.stringify(results));


                })
               
    }
}
module.exports = controller;