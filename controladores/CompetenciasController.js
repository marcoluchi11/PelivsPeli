var con = require('../conexionBD');
var controller = {
    
    buscarCompetencias: function(req,res){

        var sql = 'SELECT * FROM competencia'
        con.query(sql,function(error,resultado,fields){
            if(error){
                console.log('Hubo un error en la consulta', error.message);
                return res.status(404).send('hubo un error en la consulta');
            }
            res.send(JSON.stringify(resultado));
        })
     
     },
    obtenerOpciones: function(req,res){
           
            let id = req.params.id;
            //ID DE PELICULA, POSTER Y TITULO DE PELICULA
            let sql;
            let sql2 = 'SELECT * FROM competencia WHERE id = '+id;

            con.query(sql2,function(error,resultadoCompetencia,fields){
                if(error){
                    console.log('Hubo un error en la consulta', error.message);
                    return res.status(404).send('hubo un error en la consulta');
                }
                    
                if(resultadoCompetencia[0].genero_id === null && resultadoCompetencia[0].director_id === null){
                        sql = 'SELECT titulo,id,poster FROM pelicula ORDER BY rand() LIMIT 2;'
                    }else if(resultadoCompetencia[0].genero_id != null && resultadoCompetencia[0].director_id != null){
                        sql = 'SELECT titulo,pelicula.id,poster FROM pelicula INNER JOIN competencia ON pelicula.genero_id = competencia.genero_id JOIN director ON competencia.director_id = director.id WHERE competencia.id = '+id +' ORDER BY rand() LIMIT 2;';
                    }else if(resultadoCompetencia[0].genero_id != null && resultadoCompetencia[0].director_id === null){
                            sql = 'SELECT titulo,pelicula.id,poster FROM pelicula JOIN competencia ON pelicula.genero_id = competencia.genero_id WHERE competencia.id = '+id+' ORDER BY rand() LIMIT 2;';
                    }else if(resultadoCompetencia[0].genero_id === null && resultadoCompetencia[0].director_id != null){
                       sql =  'SELECT titulo,pelicula.id,poster FROM competencia JOIN director on director.id = competencia.director_id JOIN pelicula ON pelicula.director = director.nombre WHERE competencia.id = '+id +' ORDER BY rand() LIMIT 2;';
                    }   
                        
                    con.query(sql,function(error,resultadoPeliculas,fields){
                            
                            if(error || resultadoPeliculas.length < 2){
                                    console.log('Hubo un error en la consulta', error.message);
                                    return res.status(404).send('hubo un error en la consulta');
                            }
                            if(error) return res.status(500).json(error);
                            let respuesta = {
                                    //FALTA HACER QUE APAREZCA EL NOMBRE DE LA COMPETENCIA
                                    'id': resultadoCompetencia,
                                    'peliculas':resultadoPeliculas,
                            }
                            res.send(JSON.stringify(respuesta));
                            
                    });
            
                });
            
    },

        
    
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

    mostrarResultados: function(req,res){
            let id = req.params.id;
        let sql = 'select pelicula.id, pelicula.poster, pelicula.titulo, count(*) as votos from pelicula join votos on pelicula.id = votos.pelicula_id join competencia on competencia.id = votos.competencia_id where competencia.id = '+id+' group by pelicula.titulo order by votos desc limit 3';
        con.query(sql,function(error,results,fields){

            if(error){
                console.log('Hubo un error en la consulta', error.message);
                return res.status(404).send('hubo un error en la consulta');
            }
            if(error) return res.status(500).json(error);

            let response = {
                'resultados': results,
            }
            res.send(JSON.stringify(response));
        })

    },
    crearCompetencia: function(req,res){
//
                let request = req.body;
                let genero = request.genero === '0' ? null : request.genero;
                let director = request.director === '0' ? null : request.director;
                let nuevaCompetencia = request.nombre;
                console.log('el req body es : ', request);
                console.log('el genero elegido es :' + genero);
                console.log('el director elegido es :' + director);
                console.log('la nueva competencia es : '+ nuevaCompetencia);
                con.query('SELECT nombre FROM competencia', function(error,resultadoCompetencia,fields){
                    for(let i=0;i<resultadoCompetencia.length;i++){
                        if(nuevaCompetencia === resultadoCompetencia[i].nombre){
                            return res.status(422).send('ya hay un nombre existente en la lista de competencias ')
                        }
                    }
                con.query('INSERT INTO competencia (nombre,genero_id,director_id) VALUES (?,?,?)',[nuevaCompetencia,genero,director],function(error,results,fields){
                    
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

    editarCompetencia : function(req,res){
        
            let id = req.params.id;
            let request = req.body;
            let nombre = request.nombre;
            console.log(nombre);
            let sql = 'UPDATE competencia SET nombre = '+'"'+nombre+'"'+' where id = '+id;
            console.log(sql);
            con.query(sql,function(error,results,fields){
                if(error){
                    console.log('Hubo un error en la consulta', error.message);
                    return res.status(404).send('hubo un error en la consulta');
                }
                if(error) return res.status(500).json(error);
                res.send(JSON.stringify(results));
            })

    },
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