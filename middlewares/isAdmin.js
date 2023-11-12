const jwt = require('jsonwebtoken');

const isAdmin = (req,res,next) =>{
    if(
        req.url.includes('/login')
         || req.url.includes('/')
         || req.url.includes('/images/')
        || req.url.includes('/profiles/')
        || req.url.includes('/css/')
        || req.url.includes('/dist/')
        || req.url.includes('/plugins/')
        ){
            return next();
    }

    let token = req.cookies.jwt_token;

    let decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if(decodedToken.role == 'admin'){
        return next();
    }

    return res.render('errors/401',{
        url: req.url
    })
}


module.exports = {
    isAdmin
}