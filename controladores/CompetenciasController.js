let con = require('../conexionBD');
let controller = {
    
    // SE OBTIENEN LAS COMPETENCIAS
    buscarCompetencias: function(req,res){

        let sql = 'SELECT * FROM competencia'
        con.query(sql,function(error,resultado,fields){
            if(error){
                console.log('Hubo un error en la consulta', error.message);
                return res.status(404).send('hubo un error en la consulta');
            }
            if(error) return res.status(500).json(error);
            res.send(JSON.stringify(resultado));
        })
     
     },
     // SE OBTIENEN LOS RESULTADOS
    obtenerOpciones: function(req,res){
           
            let id = req.params.id;
            //ID DE PELICULA, POSTER Y TITULO DE PELICULA
            let sqlQuery;
            let sqlCompetencia = "SELECT nombre, genero_id, director_id, actor_id FROM competencia WHERE id = " + id + ";";

            con.query(sqlCompetencia,function(error,resultadoCompetencia,fields){
                if(error){
                    console.log('Hubo un error en la consulta', error.message);
                    return res.status(404).send('hubo un error en la consulta');
                }
                let queryPeliculas = "SELECT DISTINCT pelicula.id, poster, titulo, genero_id FROM pelicula LEFT JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id LEFT JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id WHERE 1 = 1";
                let genero = resultadoCompetencia[0].genero_id;
                let actor = resultadoCompetencia[0].actor_id;
                let director = resultadoCompetencia[0].director_id;
                let queryGenero = genero ? ' AND pelicula.genero_id = '  + genero : '';
                let queryActor = actor ? ' AND actor_pelicula.actor_id = ' + actor : '';
                let queryDirector = director ? ' AND director_pelicula.director_id = ' + director : '';
                let orden = ' ORDER BY RAND() LIMIT 2';
                
                let sqlQuery = queryPeliculas + queryGenero + queryActor + queryDirector + orden;
                console.log(sqlQuery);
                    con.query(sqlQuery,function(error,resultadoPeliculas,fields){
                            // VER VALIDADOR DE LENGTH
                            
                            if(error){
                                    console.log('Hubo un error en la consulta');
                                    return res.status(404).send('hubo un error en la consulta');
                            }
                            if(error) return res.status(500).json(error);
                            let respuesta = {
                                    //FALTA HACER QUE APAREZCA EL NOMBRE DE LA COMPETENCIA
                                    'peliculas': resultadoPeliculas,
                                    'competencia': resultadoCompetencia[0].nombre
                            }
                            res.send(JSON.stringify(respuesta));
                    });
                });
            
    },
    // SE AGREGA VOTO A PELICULA SELECCIONADA
    agregarVoto: function(req,res){

            let nuevoVoto = req.body;
            let idPelicula = nuevoVoto.idPelicula;
            let idCompetencia = req.params.id;
            con.query('INSERT INTO votos (pelicula_id,competencia_id) VALUES (?,?)',[idPelicula, idCompetencia],function(error,results,fields){
                if(error){
                    console.log('Hubo un error en la consulta', error.message);
                    return res.status(404).send('hubo un error en la consulta');
                }
                if(error) return res.status(500).json(error);
                
                let response = {

                    'votos': results,
                }
                res.send(JSON.stringify(response));

            })
    },
    // SE MUESTRAN RESULTADOS POR COMPETENCIA
    mostrarResultados: function(req,res){
            let id = req.params.id;
        let sql = 'select pelicula.id, pelicula.poster, pelicula.titulo, count(*) as votos from pelicula join votos on pelicula.id = votos.pelicula_id join competencia on competencia.id = votos.competencia_id where competencia.id = '+id+' group by pelicula.titulo order by votos desc limit 3';
        con.query(sql,function(error,resultados,fields){
            
            if (resultados.length === 0) {
                console.log("No se encontro ninguna competencia con el id seleccionado");
                return res.status(404).send("No se encontro ninguna competencia con el id seleccionado");
            }
            if(error) return res.status(500).json(error);

            let response = {
                'resultados': resultados,
            }
            res.send(JSON.stringify(response));
        })
    },
    // SE CREA COMPETENCIA CON SUS CORRECTAS VALIDACIONES
    crearCompetencia: function(req,res){

                let request = req.body;
                let genero = request.genero === '0' ? null : request.genero;
                let director = request.director === '0' ? null : request.director;
                let actor = request.actor === '0' ? null : request.actor;
                let nuevaCompetencia = request.nombre;
                
                con.query('SELECT nombre FROM competencia', function(error,resultadoCompetencia,fields){
                    for(let i=0;i<resultadoCompetencia.length;i++){
                        if(nuevaCompetencia === resultadoCompetencia[i].nombre){
                            return res.status(422).send('ya hay un nombre existente en la lista de competencias ')
                        }
                    }

                    let queryPeliculas = "SELECT DISTINCT pelicula.id, poster, titulo, genero_id FROM pelicula LEFT JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id LEFT JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id WHERE 1 = 1";
                    let queryGenero = genero ? ' AND pelicula.genero_id = '  + genero : '';
                    let queryActor = actor ? ' AND actor_pelicula.actor_id = ' + actor : '';
                    let queryDirector = director ? ' AND director_pelicula.director_id = ' + director : '';
                    let sqlQuery = queryPeliculas + queryGenero + queryActor + queryDirector;
                    con.query(sqlQuery,function(error,resultadoQuery,fields){
                    if(director != null || actor != null){
                        
                        if(resultadoQuery.length < 2){
                            console.log('No hay suficientes peliculas para armar esta competencia');
                            return res.status(404).send('No hay suficinetes peliculas para armar esta competencia');
                        }
                    }
                        con.query('INSERT INTO competencia (nombre,genero_id,director_id,actor_id) VALUES (?,?,?,?)',[nuevaCompetencia,genero,director,actor],function(error,results,fields){
                            
                            if(error){
                                console.log('Hubo un error en la consulta', error.message);
                                return res.status(404).send('hubo un error en la consulta');
                            }
                            if(error) return res.status(500).json(error);
                            res.send(JSON.stringify(results));
                        })
                })
            })
    },
    // REINICIO DE VOTOS POR COMPETENCIA
    reiniciarVotos: function(req,res){

                let id = req.params.id;
                let sql = 'DELETE FROM votos WHERE competencia_id = ' + id;
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
               
    },
    // ELIMINACION DE COMPETENCIA
    eliminarCompetencia: function(req,res){
                let id = req.params.id;
                let sqlVotos = 'DELETE FROM votos WHERE competencia_id = ' +id;
                let sqlCompetencia = 'DELETE FROM competencia WHERE id = '+id;
                con.query(sqlVotos,function(error,resultadoVotos,fields){
                    if(error){
                        console.log('Hubo un error en la consulta', error.message);
                        return res.status(404).send('hubo un error en la consulta');
                    }
                    if(error) return res.status(500).json(error);
                    console.log('se eliminaron los votos con exito');
                    con.query(sqlCompetencia,function(error,resultadoCompetencia,fields){

                        if(error){
                            console.log('Hubo un error en la consulta', error.message);
                            return res.status(404).send('hubo un error en la consulta');
                        }
                        if(error) return res.status(500).json(error);
                        console.log('Se elimino la competencia con exito');
                        res.send(JSON.stringify(resultadoVotos,resultadoCompetencia));
                    })
                })     
                

                
    },
    // EDICION DE COMPETENCIA;
    editarCompetencia : function(req,res){
        
            let id = req.params.id;
            let request = req.body;
            let nombre = request.nombre;
            let sql = 'UPDATE competencia SET nombre = '+'"'+nombre+'"'+' where id = '+id;
            con.query(sql,function(error,resultado,fields){
                if (resultado.length == 0){
                console.log("No se encontro la pelicula buscada con ese id");
                return res.status(404).send("No se encontro ninguna pelicula con ese id");
            } else {
                if(error) return res.status(500).json(error);
                res.send(JSON.stringify(resultado));
                }
            })
            

    },
    // SE MUESTRAN LAS COMPETENCIAS
    nombreCompetencia: function (req, res){
        let id = req.params.id;
        let sql = "SELECT competencia.id, competencia.nombre, genero.nombre genero, director.nombre director, actor.nombre actor FROM competencia LEFT JOIN genero ON genero_id = genero.id LEFT JOIN director ON director_id= director.id LEFT JOIN actor ON actor_id= actor.id WHERE competencia.id = " + id;
        con.query(sql, function(error, resultado){
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send('hubo un error en la consulta');
            }
            if(error) return res.status(500).json(error);
            let response = {
                'id': resultado,
                'nombre': resultado[0].nombre,
                'genero_nombre': resultado[0].genero,
                'actor_nombre': resultado[0].actor,
                'director_nombre': resultado[0].director
            }
            res.send(JSON.stringify(response));
        });
    },
    // SE AGREGAN GENEROS
    agregarGeneros: function (req,res){

                let sql = 'select * from genero;';
                con.query(sql,function(error,results,fields){
                    if(error){
                        console.log('Hubo un error en la consulta', error.message);
                        return res.status(404).send('hubo un error en la consulta');
                    }
                    if(error) return res.status(500).json(error);
                    res.send(JSON.stringify(results));
                })
    },
    // SE AGREGAN DIRECTORES
    agregarDirectores: function(req,res){

        let sql = 'select * from director;';
        con.query(sql,function(error,results,fields){
            if(error){
                console.log('Hubo un error en la consulta', error.message);
                return res.status(404).send('hubo un error en la consulta');
            }
            if(error) return res.status(500).json(error);
            res.send(JSON.stringify(results));
        })
    },
    // SE AGREGAN ACTORES
    agregarActores: function(req,res){

        let sql = 'select * from actor'
        con.query(sql,function(error,results,fields){
            if(error){
                console.log('Hubo un error en la consulta', error.message);
                return res.status(404).send('hubo un error en la consulta');
            }
            if(error) return res.status(500).json(error);
            res.send(JSON.stringify(results));
        })
    },
    
}

module.exports = controller;