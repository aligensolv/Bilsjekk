const ssh2 = require('ssh2');

const conn = new ssh2.Client();
let pm2Path = '/root/.nvm/versions/node/v18.0.0/bin/pm2'


conn.on('ready', () => {
  console.log('Connected to VPS');
});

conn.on('error', (err) => {
  console.error(`Error connecting to VPS: ${err.message}`);
});

// Connect to your VPS using SSH
conn.connect({
  host: '62.72.18.83',
  port: 22,
  username: 'root',
  password: 'ray01ocruwRiP=LgEvoQ',
});

function restartVPS(){
   // Restart your VPS by executing a command
  conn.exec(`export PATH=$PATH:/root/.nvm/versions/node/v18.0.0/bin/ && ${pm2Path} restart nordic`, (err, stream) => {
    if (err) {
        console.log(err);
        throw err
    };
    
    stream.on('close', (code, signal) => {
      console.log(`Command execution completed with code ${code}`);
    }).on('data', (data) => {
      console.log(`Command output: \n${data}`);
      return data
    });
  });
}


function updateNordic(){
   // Restart your VPS by executing a command
   conn.exec('cd ~/workspace/Bilsjekkserverp && git pull', (err, stream) => {
    if (err) {
        console.log(err);
        throw err
    };
    
    stream.on('close', (code, signal) => {
      console.log(`Command execution completed with code ${code}`);
    }).on('data', (data) => {
      console.log(`Command output: \n${data}`);
      restartVPS()
    });
  });
}


function prepareBackup(){
  const now = new Date();
  const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  const localDateString = localDate.toISOString().split('T')[0];
  
  // Restart your VPS by executing a command
  conn.exec(`
  mkdir -p ~/backup \
  && cp -R ~/workspace/Bilsjekkserverp/public ~/backup \
  && cd ~/backup \
  && mkdir ${localDateString} \
  && cd ${localDateString} \
  && mongoexport --uri="mongodb://admin:admin123@127.0.0.1:27017/admin"  --collection=users  --out=users.json \
  && mongoexport --uri="mongodb://admin:admin123@127.0.0.1:27017/admin"  --collection=violations  --out=violations.json \
  && mongoexport --uri="mongodb://admin:admin123@127.0.0.1:27017/admin"  --collection=pdfs  --out=pdfs.json \
  && mongoexport --uri="mongodb://admin:admin123@127.0.0.1:27017/admin"  --collection=pdfarchieves  --out=pdfarchieves.json \
  && mongoexport --uri="mongodb://admin:admin123@127.0.0.1:27017/admin"  --collection=locations  --out=locations.json \
  && mongoexport --uri="mongodb://admin:admin123@127.0.0.1:27017/admin"  --collection=groups  --out=groups.json \
  && mongoexport --uri="mongodb://admin:admin123@127.0.0.1:27017/admin"  --collection=formfields  --out=formfields.json \
  && mongoexport --uri="mongodb://admin:admin123@127.0.0.1:27017/admin"  --collection=cars  --out=cars.json \
  && mongoexport --uri="mongodb://admin:admin123@127.0.0.1:27017/admin"  --collection=accidents  --out=accidents.json \
  `, (err, stream) => {
   if (err) {
       console.log(err);
       throw err
   };
   
   stream.on('close', (code, signal) => {
     console.log(`Command execution completed with code ${code}`);
   }).on('data', (data) => {
     console.log(`Command output: \n${data}`);
   });
 });
}

module.exports = {
  updateNordic,
  restartVPS,
  prepareBackup
}