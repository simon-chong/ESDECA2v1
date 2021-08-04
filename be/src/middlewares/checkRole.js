// const config = require("../config/config");
// const jwt = require("jsonwebtoken");
// exports.checkRole = (req, res, next) => {
//   //If the token is valid, the logic extracts the user id and the role information.
//   //If the role is not user, then response 403 UnAuthorized
//   //The user id information is inserted into the request.body.userId
//   console.log("http header - user ", req.headers["user"]);
//   if (typeof req.headers.authorization !== "undefined") {
//     // Retrieve the authorization header and parse out the
//     // JWT using the split function
//     let token = req.headers.authorization.split(" ")[1];
//     //console.log('Check for received token from frontend : \n');
//     console.log(token);
//     jwt.verify(token, config.JWTKey, (err, data) => {
//       console.log("data extracted from token \n", data);
//       if (err) {
//         console.log(err);
//         return res.status(403).send({ message: "Unauthorized access" });
//       } else {
//         if (data.role_name != "admin") {
//           return res.status(403).send({ result: "denied" }); // checks if userid matches the one in token
//         } else {
//             return res.status(400).send({ result: "allowed" });
//         }
//       }
//     });
//   } else {
//     return res.status(403).send({ message: "Unauthorized access" });
//     console.log("unauthorized");
//   }
// }; //End of checkRole
// does not work, router does not do its job