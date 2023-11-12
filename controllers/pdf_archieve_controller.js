const User = require('../models/usersModel')
const PDFArchieve = require('../models/PdfArchieve')

const storeArchieve = async ({ id, pdfData }) =>{
  const user = await User.findOne({ _id:id })

  const archieve = new PDFArchieve({
    ...pdfData,
    username:user.name,
    accountId: user.accountId,
  })

  console.log(archieve)


  await archieve.save()
}


module.exports = {
  storeArchieve
}