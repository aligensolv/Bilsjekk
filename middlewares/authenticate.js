const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET_KEY

const authenticate_front = (req,res,next) => {
    try{
        if(req.url.includes('login')){
            return next()
        }

        let jwt_token = req.cookies.jwt_token
        let decoded = jwt.verify(jwt_token,jwt_secret)
        let isLogged = req.cookies.is_logged

        if(decoded && isLogged == 'true'){
            return next()
        }
        
        // return res.render('errors/401',{
        //     url: req.url
        // })
    }catch(e){
        return res.redirect('/login')
    }
}

module.exports = authenticate_front