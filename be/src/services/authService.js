config = require("../config/config");
const logger = require("../assets/js/logger");
const pool = require("../config/database");
module.exports.authenticate = (email, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      if (err) throw err;
    } else {
      try {
        connection.query(
          `SELECT user.user_id, fullname, email, user_password, role_name, user.role_id  
                   FROM user INNER JOIN role ON user.role_id=role.role_id AND email=?`,
          [email],
          (err, rows) => {
            if (err) {
              if (err) return callback(err, null);
            } else {
              if (rows.length == 1) {
                logger.info(rows);
                return callback(null, rows);
              } else {
                logger.error(email);
                logger.error(err);
                logger.error(rows);
                return callback("Login has failed", null);
              }
            }
            connection.release();
          }
        );
      } catch (error) {
        return callback(error, null);
      }
    }
  }); //End of getConnection
}; //End of authenticate
