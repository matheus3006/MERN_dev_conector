const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

const router = express.Router();

const auth = require('../../middleware/auth');
//Model from mongo db
const User = require('../../models/User');
//@route    GET api/auth
//@desc     Test route
//@access   Public

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
//@route POST api/auth
//@desc  Authenticate user & get token
//@access public
router.post(
  '/',
  [
    check('email', 'Please Include a valid email').isEmail(),

    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //Look to see if there are errors
    if (!errors.isEmpty()) {
      //if any of the requested values don't match it will return the errors.
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    try {
      //see if users exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      //Matching user and password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'invalid credentials' }] });
      }

      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);






module.exports = router;
