const user = require("../services/userService");
const auth = require("../services/authService");
const bcrypt = require("bcrypt");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const logger = require("../assets/js/logger");

exports.getRole = (req, res, next) => {
  let decoded = jwt.decode(req.token);
 logger.info("getRole called" + decoded.id + decoded.role_name)
  if (decoded.role_name == "admin") {
    return res.status(200).json({ redirect: "admin/manage_users.html", token: req.token, user_id: decoded.id});
    logger.info(res.data);
  } else if (decoded.role_name == "user") {
    return res.status(200).json({ redirect: "user/manage_submission.html", token: req.token, user_id: decoded.id });
    logger.info(res.data);
  } else {
    return res.status(404).json({ message: "no existing role" });
    logger.error(res.data);
  }
};

exports.processLogin = (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  const emailRegex = /\S+@\S+.\S+/;

  if (emailRegex.test(email)) {
    try {
      auth.authenticate(email, function (error, results) {
        if (error) {
          logger.error(error);
          let message = "Credentials are not valid.";
          logger.error(message);
          //return res.status(500).json({ message: message });
          //If the following statement replaces the above statement
          //to return a JSON response to the client, the SQLMap or
          //any attacker (who relies on the error) will be very happy
          //because they relies a lot on SQL error for designing how to do
          //attack and anticipate how much "rewards" after the effort.
          //Rewards such as sabotage (seriously damage the data in database),
          //data theft (grab and sell).
          return res.status(500).json({ message: error }); //poor error handling
        } else {
          if (results.length == 1) {
            if (password == null || results[0] == null) {
              return res.status(500).json({ message: "login failed" });
            }
            if (
              bcrypt.compareSync(password, results[0].user_password) == true
            ) {
              let token = jwt.sign(
                  { id: results[0].user_id, role_name: results[0].role_name },
                  config.JWTKey,
                  {
                    expiresIn: 86400, //Expires in 24 hrs
                  }
                ),
                data = {
                  user_id: results[0].user_id,
                  token: token,
                }; //End of data variable setup
                logger.info("login success");
              req.token = token;
              next();
            } else {
              // return res.status(500).json({ message: 'Login has failed.' });
              logger.error("wrongpasswordmaybe");
              return res.status(500).json({ message: error }); //poor error handling
            } //End of passowrd comparison with the retrieved decoded password.
          } //End of checking if there are returned SQL results
        }
      });
    } catch (error) {
      const message = "Error authenticating account";
      return res.status(500).json({ message: error }); //poor error handling
    } //end of try
  } else {
    return res
      .status(400)
      .json({ message: "Email does not meet the requirements" });
  }
};

exports.processRegister = (req, res, next) => {
  logger.info("processRegister running.");
  let fullName = req.body.fullName;
  let email = req.body.email;
  let password = req.body.password;

  if (fullName.length == 0) {
    return res.status(400).json({ message: "Name is empty" });
  } else if (email.length == 0) {
    return res.status(400).json({ message: "Email is empty" });
  } else if (password.length == 0) {
    return res.status(400).json({ message: "Password is empty" });
  } else {
    const nameRegex = new RegExp("[a-zA-Z]+");
    const emailRegex = /\S+@\S+.\S+/;

    if (!nameRegex.test(fullName)) {
      return res
        .status(400)
        .json({ message: "Name can only have small or capital letters" });
    } else if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email Address is invalid" });
    } else {
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
          logger.error("Error on hashing password");
          return res
            .status(500)
            .json({ statusMessage: "Unable to complete registration" });
        } else {
          results = user.createUser(
            fullName,
            email,
            hash,
            function (results, error) {
              if (results != null) {
                logger.info(results);
                return res
                  .status(200)
                  .json({ statusMessage: "Completed registration." });
              }
              if (error) {
                logger.error(
                  "processRegister method : callback error block section is running."
                );
                logger.error(
                  error,
                  "=================================================================="
                );
                return res
                  .status(500)
                  .json({ statusMessage: "Unable to complete registration" });
              }
            }
          ); //End of anonymous callback function
        }
      });
    }
  }
}; // End of processRegister
