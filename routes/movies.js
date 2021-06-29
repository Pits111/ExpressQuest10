// Create the router object that will manage all operations on users
const usersRouter = require('express').Router();
// Import the user model that we'll need in controller functions
const User = require('../models/user');

// GET /api/users/
usersRouter.get('/', (req, res) => {
  const { language } = req.query;
  User.findMany({ filters: { language } })
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error retrieving users from database');
    });
});

// GET /api/users/:id
usersRouter.get('/:id', (req, res) => {
    const usersId = req.params.id;
    User.findOne( usersId )
      .then((users) => {
        res.json(users[0]);
      })
      .catch((err) => {
        console.log(err);
        if(err=='RECORD_NOT_FOUND') {
            res.status(404).send('No User was found');
        }
        else(res.status(500).send('Error retrieving users from database'));
        
      });
});

// POST /api/users/
usersRouter.post('/', (req, res) => {
    const { email } = req.body;
    let validationErrors = null;
    User.findEmail(email)
      .then((existingUser) => {
        validationErrors = User.validate(req.body);
        if (existingUser) {
          return Promise.reject('DUPLICATE_EMAIL');
        }
        else if (validationErrors) {
          return Promise.reject('INVALID_DATA');
        }
        else {
          return User.createOne(req.body);
        }
      })
      .then((createdUser) => {
        res.status(201).json(createdUser);
      })
      .catch((err) => {
        console.error(err);
        if (err === 'DUPLICATE_EMAIL')
          res.status(409).json({ message: 'This email is already used' });
        else if (err === 'INVALID_DATA')
          res.status(422).json({ validationErrors });
        else res.status(500).send('Error saving the user');
      });
  });

// PUT /api/users/:id
usersRouter.put('/:id', (req, res) => {
    let existingUser = null;
    let validationErrors = null;
    User.findOne(req.params.id)
        .then((user) => {
            existingUser = user;
            if (!existingUser) return Promise.reject('RECORD_NOT_FOUND');
            validationErrors = User.validate(req.body, false);
            if (validationErrors) return Promise.reject('INVALID_DATA');
            return User.update(req.params.id, req.body);
        })
        .then(() => {
            res.status(200).json({ ...existingUser, ...req.body });
        })
        .catch((err) => {
            console.error(err);
            if (err === 'RECORD_NOT_FOUND')
                res.status(404).send(`User with id ${req.params.id} not found.`);
            else if (err === 'INVALID_DATA')
                res.status(422).json({ validationErrors: validationErrors.details });
            else res.status(500).send('Error updating a User.');
        })
    ;
});

// DELETE /api/users/:id
usersRouter.delete('/:id', (req, res) => {
    User.destroy(req.params.id)
        .then((deleted) => {
            if (deleted) res.status(200).send('🎉 User deleted!');
            else res.status(404).send('User not found');
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error deleting a user');
        })
    ;
});

module.exports = usersRouter;