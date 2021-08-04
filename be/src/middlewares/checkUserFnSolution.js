const config = require("../config/config");
const jwt = require("jsonwebtoken");
const logger = require("../assets/js/logger");
module.exports.checkForValidUserRoleUser = (req, res, next) => {
  //If the token is valid, the logic extracts the user id and the role information.
  //If the role is not user, then response 403 UnAuthorized
  //The user id information is inserted into the request.body.userId
  logger.info("http header - user ", req.headers["user"]);
  if (typeof req.headers.authorization !== "undefined") {
    // Retrieve the authorization header and parse out the
    // JWT using the split function
    let token = req.headers.authorization.split(" ")[1];
    //console.log('Check for received token from frontend : \n');
    logger.info(token);
    jwt.verify(token, config.JWTKey, (err, data) => {
      logger.info("data extracted from token \n", data);
      if (err) {
        logger.error(err);
        return res.status(403).send({ message: "Unauthorized access" });
      } else {
        if (data.id != req.headers.user) {
          return res.status(403).send({ message: "Unauthorized access" }); // checks if userid matches the one in token
        } else {
          req.body.userId = data.id;
          next();
        }
      }
    });
  } else {
    res.status(403).send({ message: "Unauthorized access" });
    logger.warning("unauthorized");
  }
}; //End of checkForValidUserRoleUser
