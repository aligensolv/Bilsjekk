const express = require('express')
const router = express.Router()
const uuid = require('uuid')

const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/')
  },
  filename: (req, file, cb) => {
    cb(null, `${uuid.v4()}-${file.originalname}`)
  },
})

const upload = multer({ storage: storage })
const UserController = require('../controllers/users_controller')

router.get('/users', UserController.getAllUsers);



router.get('/users/user', UserController.getUser);

router.post('/users', UserController.register);

router.put('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);
router.delete('/users', UserController.deleteAllUsers);

router.post('/users/login', UserController.login);


router.get('/users/token/validate', UserController.validateToken)


module.exports = router
