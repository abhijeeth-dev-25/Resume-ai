const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklist.model");

async function authUserMiddleware(req,res,next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message: "Token not found, authorization denied"
        })
    }

    const blacklistedToken = await blacklistModel.findOne({token});

    if(blacklistedToken){
        return res.status(401).json({
            message: "Token is invlaid"
        })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // keep a consistent shape: controllers expect `req.user.id`
        req.user = { id: decoded.userId };

        next(); 

    }catch(error){

        return res.status(401).json({
            message: "Invalid token, authorization denied"
        })

    }
}

module.exports = {authUserMiddleware};