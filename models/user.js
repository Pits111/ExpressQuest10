const connection = require('../db-config');
const Joi = require('joi');
const db = connection.promise();

const argon2 = require('argon2');


const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1
};


const hashPassword = (plainPassword) => {
  return argon2.hash(plainPassword, hashingOptions);
};

const verifyPassword = (plainPassword, hashedPassword) => {
  return argon2.verify(hashedPassword, plainPassword, hashingOptions);
};

const validate = (data, forCreation = true) => {
    const presence = forCreation ? 'required' : 'optional';
    return Joi.object({
      email: Joi.string().email().max(255).presence(presence),
      firstname: Joi.string().max(255).presence(presence),
      lastname: Joi.string().max(255).presence(presence),
      city: Joi.string().max(255),
      language: Joi.string().max(255),
      password: Joi.string().max(255).presence(presence),
    }).validate(data, { abortEarly: false }).error;
};

const findMany = ({ filters: { language } }) => {
  let sql = 'SELECT firstname, lastname, email, city, language FROM users';
  const sqlValues = [];
  if (language) {
    sql += ' WHERE language = ?';
    sqlValues.push(language);
  }
  return db.query(sql, sqlValues).then(([results]) => results);
};

const findOne = (id) => {
    return db.query('SELECT firstname, lastname, email, city, language, FROM users WHERE id = ?',[id])
    .then(([results]) => {
        if (results.length==0){
            return Promise.reject('RECORD_NOT_FOUND')
        }
        return results;
    }
    );
};

const verify = (email, password) => {
  return db
    .query('SELECT hashedPassword FROM users WHERE email = ?', [email])
    .then(([results])=> results[0])
    .then(result=> {
      return verifyPassword(password, result.hashedPassword)
    })
}
const findEmail = (email) => {
  return db
    .query('SELECT * FROM users WHERE email = ?', [email])
    .then(([results]) => results[0]);
};
const createOne = ({firstname, lastname, email, city, language, password}) => {
    //const hashedPassword = hashPassword(password);

    return hashPassword(password)
        .then ((hashedPassword)=> db.query('INSERT INTO users (firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?)',
        [firstname, lastname, email, city, language, hashedPassword]))
        .then (([result])=> {
          const id = result.insertId;
          const createdUser = { id, firstname, lastname, email, city, language };
          return createdUser;
        });
};

const update = (id, newAttributes) => {
    return db.query('UPDATE users SET ? WHERE id = ?', [newAttributes, id]);
};
  
const destroy = (id) => {
    return db
      .query('DELETE FROM users WHERE id = ?', [id])
      .then(([result]) => result.affectedRows !== 0);
};




module.exports = {
  findMany, 
  findOne, 
  findEmail, 
  createOne, 
  update, 
  destroy, 
  validate, 
  hashPassword,
  verifyPassword,
  verify
}
