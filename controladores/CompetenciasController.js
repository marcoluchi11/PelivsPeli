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
                        'id': resultadoCompetencia[0],
                        'peliculas':resultadoPeliculas,
                    }
                    console.log(resultadoPeliculas);
                    console.log(resultadoCompetencia[0]);
                    res.send(JSON.stringify(respuesta));
            });
        })
    }
}
module.exports = controller