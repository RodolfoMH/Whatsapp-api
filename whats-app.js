const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');
const qrcode = require('qrcode-terminal');
const test = require('./test')

let client;
let sessionData;

const SESSION_FILE_PATH = './sessions.json';

const spinner = ora(`Cargando ${chalk.yellow('Validando session con Whatsapp...')}`);
const reconnectSpinner = ora(`${chalk.yellow('Reconectando... ')}`);
const waitConnectionSpinner = ora(`${chalk.yellow('Esperando autenticación... ')}`);

const conSession = (callback) =>{

    // Si existe cargamos el archivo con las credenciales
    sessionData = require(SESSION_FILE_PATH);
    spinner.start();

    client = new Client({
        session: sessionData
    });

    client.on('ready', () => {
        spinner.succeed(chalk.green(' Client connected!'))
        spinner.stop();
        reconnectSpinner.stop();
        if(callback!=undefined){
            callback('Client connected!');
        }
        conectionReady();
    });

    client.on('auth_failure', () => {
        spinner.stop();
        spinner.fail(chalk.yellow(' ** Error de autentificacion vuelve a generar el QRCODE **'));
        fs.truncate(SESSION_FILE_PATH, ()=>{
            sinSession(callback);
        });
    })

    client.on('disconnected', () => {
        reconnectSpinner.warn(chalk.red(' Cliente desconectado.'));
        reconnectSpinner.start();
        reconnet();
    });

    client.initialize();
}

/**
 * Esta funcion genera el Qr code
 */
const sinSession = (callback) =>{

    console.log(chalk.yellow('Aun no se ha iniciado sesión. '))

    client = new Client();
    console.log(chalk.yellow('Generando QR ...'))

    client.on('qr', (qr) => {
        qrcode.generate(qr,{small:true})
        waitConnectionSpinner.start()
    });

    client.on('authenticated', (sessions) => {
        sessionData = sessions;
        waitConnectionSpinner.stop();
        spinner.succeed(chalk.green(' authentication succcess!'))
        fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(sessions), (err)=>{console.log(err)})
    });

    client.on('ready', () => {
       spinner.succeed(chalk.green(' Client connected!'));
       if(callback!=undefined){
        callback('Client connected!');
    }
        conectionReady();
    });

    client.on('disconnected', () => {
        reconnectSpinner.warn(chalk.red(' Cliente desconectado.'));
        reconnectSpinner.start();
        reconnet();
    });

    client.initialize();
}

module.exports.sendMessage = async (number = null, text = null) => {
    number = number.replace('@c.us', '');
    number = `${number}@c.us`
    const message = text || `Hola soy un BOT recuerda https://www.youtube.com/leifermendez`;
    client.sendMessage(number, message);
    //readChat(number, message)
    console.log(`${chalk.red('⚡⚡⚡ Enviando mensajes....')}`);
}

const conectionReady = () =>{
    //sendMessage('18298510538',"Hola");
    listenMessage();
}

const listenMessage = () => {
    client.on('message', async msg => {
        const { from, to, body } = msg;
        if (!msg.hasMedia) {
            console.log(chalk.blue('from: ')+from + chalk.blue('\n to: ')+to+ chalk.green(' msg: ')+body);
            if(body.match(/^wiki .*/i)){
                var busqueda = body.replace(/(w|W)iki\s*/g,'');
                test.search(busqueda, (result)=>{
                    console.log(result);
                    msg.reply(result);
                })
            }
        }
    });
}

const reconnet = () =>{

    sessionData = require(SESSION_FILE_PATH);

    client = new Client({
        session: sessionData
    });

    client.on('ready', () => {
        spinner.succeed(chalk.green(' Client connected!'))
        reconnectSpinner.stop();
        conectionReady();
    });

    client.on('auth_failure', () => {
        spinner.stop();
        spinner.fail(chalk.yellow(' ** Error de autentificacion vuelve a generar el QRCODE **'));
        fs.truncate(SESSION_FILE_PATH, ()=>{
            sinSession();
        });
    })

    client.on('disconnected', () => {
        reconnectSpinner.warn(chalk.red(' Cliente desconectado.'));
        reconnectSpinner.start();
        reconnet();
    });

    client.initialize();
}

module.exports.connect = async (callback) =>{
    (fs.existsSync(SESSION_FILE_PATH)) ? conSession(callback) : sinSession(callback);
}
