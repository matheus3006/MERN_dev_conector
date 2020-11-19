const express  = require('express');
const {check, validationResult} = require("express-validator");




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
],(req,res)=> {
    const errors = validationResult(req);
    //Look to see if there are errors
    if(!errors.isEmpty()){
        //if any of the requested values don't match it will return the errors.
        return res.status(400).json({
            errors: errors.array()
        });
    }
    
    
    console.log(req.body);
    res.send('resgistration route');
});





module.exports = router;