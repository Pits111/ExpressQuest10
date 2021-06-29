const connection = require('../db-config');
const Joi = require('joi');
const db = connection.promise();

const validate = (data, forCreation = true) => {
    const presence = forCreation ? 'required' : 'optional';
    return Joi.object({
      title: Joi.string().max(255).presence(presence),
      director: Joi.string().max(255).presence(presence),
      year: Joi.number().integer().min(1888).presence(presence),
      color: Joi.boolean().truthy(1).falsy(0).presence(presence),
      duration: Joi.number().integer().positive().presence(presence),
    }).validate(data, { abortEarly: false }).error;
};

const findMany = ({ filters: { color, max_duration } }) => {
  let sql = 'SELECT * FROM movies';
  const sqlValues = [];
  if (color) {
    sql += ' WHERE color = ?';
    sqlValues.push(color);
  }
  if (max_duration) {
    if (color) sql += ' AND duration <= ? ;';
    else sql += ' WHERE duration <= ?';
    sqlValues.push(max_duration);
  }
  return db.query(sql, sqlValues).then(([results]) => results);
};

const findOne = (id) => {
    return db.query('SELECT * FROM movies WHERE id = ?',[id])
    .then(([results]) => {
        if (results.length==0){
            return Promise.reject('RECORD_NOT_FOUND')
        }
        return results;
    }
    );
};
const createOne = ({ title, director, year, color, duration }) => {

    return db.query(
        'INSERT INTO movies(title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)',
        [title, director, year, color, duration])
        .then (([result])=> {
          const id = result.insertId;
          const createdMovie = { id, title, director, year, color, duration };
          return createdMovie;
        });
};

const update = (id, newAttributes) => {
    return db.query('UPDATE movies SET ? WHERE id = ?', [newAttributes, id]);
};
  
const destroy = (id) => {
    return db
      .query('DELETE FROM movies WHERE id = ?', [id])
      .then(([result]) => result.affectedRows !== 0);
};




module.exports = {

  findMany, findOne, createOne, update, destroy, validate

}
