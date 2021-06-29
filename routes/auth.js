 
// Create the router object that will manage all operations on auth
const authRouter = require('express').Router();
// Import the user model that we'll need in controller functions
const User = require('../models/user');


// POST /api/auth/checkCredentials
authRouter.post('/checkCredentials', (req, res) => {
    const { email, password } = req.body;
    User.findEmail(email)
      .then((existingUser) => {
        if (!existingUser) return Promise.reject('VERIFICATION_FAIL');
        else {
            return User.verify(email, password)
        }
        
      })
      .then((pwCorrect) => {
          console.log(pwCorrect);
        if (pwCorrect===false) return Promise.reject('VERIFICATION_FAIL');
        else {
            res.status(200).json({message:'user verified'})
        }
      })
      .catch((err) => {
        console.error(err);
        if (err === 'VERIFICATION_FAIL')
          res.status(401).json({ message: 'User or Password are not correct' });
      });
  });

  module.exports = authRouter;