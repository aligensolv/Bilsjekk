// with commonJS
const { Client } = require('node-scp')
const path = require('path')

async function downloadBackup () {
  try {
    const client = await Client({
      host: '62.72.18.83',
      port: 22,
      username: 'root',
      password: 'ray01ocruwRiP=LgEvoQ'
    })
    await client.downloadDir('backup/', path.join('E:','backups'))
    client.close() // remember to close connection after you finish
  } catch (e) {
    console.log(e)
  }
}
module.exports = {
  downloadBackup
}