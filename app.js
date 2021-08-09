const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = express.Router();
const chalk = require('chalk');
const ora = require('ora');
const whatsapp = require('./whats-app');

const test = require('./test')

app.use(bodyParser.json())

const spinner = ora(`Cargando ${chalk.yellow('Iniciando servidor..')}`);
spinner.start();

app.post('/whatsapp/connect', async (req,res) => {
    whatsapp.connect((mensaje)=>{
        res.jsonp({mensaje:mensaje});
    });
});
app.post('/whatsapp/sendmessage', async (req,res)=>{
    whatsapp.sendMessage(req.body.phone, req.body.body);
    res.jsonp({mensaje:req.body.body});
});

app.listen(3001, () => {
    console.log('.')
    spinner.succeed(chalk.green(' Iniciado, connect to: '+chalk.yellow('localhost:3001/whatsapp/connect')))
    //spinner.render()
    spinner.stop();
})