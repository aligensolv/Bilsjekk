const { Vonage } = require('@vonage/server-sdk');
const fs = require('fs')
const path = require('path')
const axios = require('axios');
const querystring = require('querystring');



// const vonage = new Vonage({
//   apiKey: "d1840a73",
//   apiSecret: "c2eOlaZYWqqO6DyT",
//   applicationId: "b3cc5981-a376-4298-8921-03cb678a6fcf",
//   // privateKey:"./private.key",
//   privateKey: Buffer.from(process.env.VONAGE_APPLICATION_PRIVATE_KEY64, 'base64').toString(),
// });

async function sendAlertSMS({text,to}){   

const apiUrl = 'https://rest.nexmo.com/sms/json';
axios.post(apiUrl, querystring.stringify({
  api_key: 'd1840a73',
  api_secret: 'c2eOlaZYWqqO6DyT',
  type: 'text',
  from: 'IKT-Drift',
  to: to,
  text: text
}),{
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;'
  }
})
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}


module.exports = {
  sendAlertSMS
}