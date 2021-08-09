const https = require('https')
const donparser = require("dom-parser");

const options = {
  hostname: 'es.wikipedia.org',
  port: 443,
  path:'/wiki/historia',
  method: 'GET',
  headers: { 'Content-Type': 'text/html' }
}

module.exports.search = (busqueda, callback) => {

  //console.log(busqueda)

  console.log('/wiki/'+(busqueda.charAt(0).toUpperCase() + busqueda.slice(1)).replace(/ /g,'_'))
  https.get({
    hostname: 'es.wikipedia.org',
    port: 443,
    path:'/wiki/'+(busqueda.charAt(0).toUpperCase() + busqueda.slice(1)).replace(/ /g,'_'),
    method: 'GET',
    headers: { 'Content-Type': 'text/html' }
  }, res => {

      var html="";

      //console.log(res)

      res.on('data', data => {

        html+=data;
        //console.log(data)

      }).on('end',()=>{

        //console.log('data optened')
        //console.log(html)
    
        var parser = new donparser();
        var dom = parser.parseFromString(html);

        //var result = dom.getElementsByTagName('p');
        var result = dom.getElementById('mw-content-text').childNodes[0].getElementsByTagName('p');

        //console.log(result.)

        if(result!=undefined && result.length>0){

            var text = result[0].innerHTML.replace(/<b>|<\/b>|<i>|<\/i>/g,'')
            .replace(/<sup [A-z0-9\-\s"=_]*>|<\/sup>/g,' ')
            .replace(/<a [A-z0-9="#\-\/\s%\náéíóú\(\)]*>|<\/a>/g,'')
            .replace(/<span [A-z0-9\-="]*>|<\/span>|\/[|\/]/g,'')
            .replace(/&#\d{4};/g,'')
            .replace(/ \[[0-9A-z\.\s]*\] /g,'');

            if(callback!=undefined){
              callback(text);
            }
    
        }else{
          console.log('Entro al else')
          if(callback!=undefined){
            callback('No se encontraron resultados.');
          }
        }
        
      })
  }).on('error', error => {
    console.error(error)
  })

}

