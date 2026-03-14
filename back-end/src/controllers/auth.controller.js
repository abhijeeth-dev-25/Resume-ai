const userModel = require("../models/user.model");
const blacklistModel = require("../models/blacklist.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


/**
 * @name registerUserController
 * @description This function is responsible for handling the registration of a new user. It takes in the request and response objects as parameters, and it will create a new user in the database using the userModel. The function will also handle any errors that may occur during the registration process and send appropriate responses back to the client.
 * @public
 * @param {*} req 
 * @param {*} res 
 */
async function registerUserController(req,res){
    
    const {username,email,password} = req.body;

    if(!username || !email || !password){
        return res.status(400).json({
            message: "please provide username, email, password"
        })
    }
    
    const isUserAlreadyExists = await userModel.findOne({
        $or: [{username},{email}]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message: "Account with this username or email already exists"
        })
    }
    
    const hashPassword = await bcrypt.hash(password,10);

    const user = await userModel.create({
        username,
        email,
        password: hashPassword,
    })

    //jwt.sign(payload, secretKey, options)
    const token = jwt.sign(
        {userId: user._id}, 
        process.env.JWT_SECRET, 
        {expiresIn: "1d"}
    )

    res.cookie("token", token)

    res.status(201).json({
        message: "User registered succesfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email,
        }
    })


}

/**
 * @name loginUserController
 * @description This function is responsible for handling the login of a user. It takes in the request and response objects as parameters, and it will check if the provided email and password match with any user in the database using the userModel. If the credentials are correct, it will generate a JWT token and send it back to the client in a cookie. The function will also handle any errors that may occur during the login process and send appropriate responses back to the client.
 * @public
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function loginUserController(req,res){
    
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            message: "please provide email and password"
        })
    }

    const user = await userModel.findOne({email});

    if(!user){
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if(!isPasswordCorrect){
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    //jwt.sign(payload, secretKey, options)
    const token = jwt.sign(
        {userId: user._id},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )

    res.cookie("token", token)

    res.status(200).json({
        message: "User logged in succesfully",
        user:{
            id: user.id,
            username: user.username,
            email: user.email,
        }
    })

}

/**
 * @name logoutUserController
 * @description This function is responsible for handling the logout of a user. It takes in the request and response objects as parameters, and it will add the current token to the blacklist and clear the token cookie.
 * @public              
 * @param {*} req 
 * @param {*} res 
 */
async function logoutUserController(req,res){
    
    const token = req.cookies.token;

    if(token){
        blacklistModel.create({token});
    
    }

    res.clearCookie("token");

    res.status(200).json({
        message: "User logged out successfully"
    })

}

async function getMeController(req,res){
  if(!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await userModel.findById(req.user.id);
  if(!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({
    message: "User details fetched successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    }
  });
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
}