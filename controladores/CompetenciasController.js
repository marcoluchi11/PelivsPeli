var con = require('../conexionBD');
function buscarCompetencias(req,res){

        var sql = 'select * from competencia'
        console.log(sql);
        con.query(sql,function(error,resultado,fields){
            if(error){
                console.log('Hubo un error en la consulta', error.message);
                return res.status(404).send('hubo un error en la consulta');
            }
            console.log(resultado);
            res.send(JSON.stringify(resultado));
        })
    
        
}
module.exports = {

    buscarCompetencias: buscarCompetencias,

}