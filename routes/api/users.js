const express  = require('express');
const {check, validationResult} = require("express-validator");
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//require user model
const User = require('../../models/User');


const router = express.Router();

//@route GET api/users
//@desc Test route
//@access    Public
router.get('/', (req,res)=> res.send('User route'));

//@route POST api/users
//@desc  Register User
//@acess public
router.post('/',
// setting rules for validation
[
    check('name', 'name is required')
    .not()
    .isEmpty(),

    check('email', 'Please Include a valid email')
    .isEmail(),

    check('password','Enter a valid password, which contain 8 or more characters')
    .isLength({ min:8 })
],async (req,res)=> {
    const errors = validationResult(req);
    //Look to see if there are errors
    if(!errors.isEmpty()){
        //if any of the requested values don't match it will return the errors.
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const { name, email, password } = req.body;
    
    try {
   
    //see if users exists
    let user = await User.findOne({ email });
    
    if(user){
       return res.status(400).json({ errors: [
            {msg:"User already exists"}
        ]});
    };
    //Get users gravatar
    const avatar  = gravatar.url(email,{
        s: '200',
        r: 'pg',
        d: 'mm'
    });

    user = new User({
        name,
        email,
        password,
        avatar
    });
    //Encrypt password
    const salt  = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password,salt);

    await user.save();
    //Return jsonwebtoken
    const payload = {
        user:{
            id: user.id
        }
    }

    jwt.sign(
        payload, 
        config.get('jwtSecret'),
        {expiresIn:360000},
        (err, token)=>{
            if(err) throw err;
            res.json({ token });
        }
        );





} catch (error) {
    console.error(err.message);
    res.status(500).send('Server error');
}




});





module.exports = router;