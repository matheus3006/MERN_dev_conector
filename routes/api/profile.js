const express = require('express');
const router = express.Router();
const {
  check,
  validationResult
} = require('express-validator');

const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Profile = require('../../models/Profile');

// @router  GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({
        msg: 'there is no profile for this user'
      });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

// @router  POST api/profile
// @desc    Create and update users profile
// @access  Private

router.post(
  '/',
  [
    auth,
    //express validator
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'skills is required').not().isEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      }

      const {
        company,
        website,
        location,
        bio,
        status,
        github_username,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
      } = req.body;
      //  Build profile object
      const profileFields = {};

      profileFields.user = await req.user.id;

      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (github_username) profileFields.github_username = github_username;

      if (skills) {
        profileFields.skills = skills.split(',').map((skill) => skill.trim());
      }
      console.log(profileFields.skills);

      //Build social object
      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (facebook) profileFields.social.facebook = facebook;
      if (twitter) profileFields.social.twitter = twitter;
      if (instagram) profileFields.social.instagram = instagram;
      if (linkedin) profileFields.social.linkedin = linkedin;

      try {
        let profile = await Profile.findOne({
          user: req.user.id
        });
        if (profile) {
          //update
          profile = await Profile.findOneAndUpdate({
            user: req.user.id
          }, {
            $set: profileFields
          }, {
            new: true
          });

          return res.json(profile);
        }

        profile = new Profile(profileFields);
        await profile.save();

        return res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);

// @route   GET api/profile
// @desc    Get all profiles
// @access   Public
router.get('/', async (req, res) => {
  try {
    let profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    let profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({
        msg: 'profile not found'
      });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({
        msg: 'profile not found'
      });
    }
    return res.status(500).send('Server Error');
  }
});

// @route   DELETE api/profile
// @desc    DELETE profile, user & post
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    //@todo - Remove user posts

    //remove profile
    await Profile.findOneAndRemove({
      user: req.user.id
    });

    //remove user
    await User.findOneAndRemove({
      _id: req.user.id
    });

    res.json({
      msg: 'User removed'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
  '/experience',
  [
    auth,

    check('title', 'title is required').not().isEmpty(),

    check('company', 'Company is required').not().isEmpty(),

    check('from', 'From date is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({
        user: req.user.id
      });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    });

    //  Get the remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});





module.exports = router;