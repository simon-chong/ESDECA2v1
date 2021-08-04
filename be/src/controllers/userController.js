const userManager = require("../services/userService");
const fileDataManager = require("../services/fileService");
const config = require("../config/config");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const logger = require("../assets/js/logger");
//
exports.processDesignSubmission = (req, res, next) => {
  let designTitle = req.body.designTitle;
  let designDescription = req.body.designDescription;
  let userId = req.body.userId;
  let file = req.body.file;
  fileDataManager.uploadFile(file, async function (error, result) {
    logger.info(
      "check result variable in fileDataManager.upload code block\n",
      result
    );
    logger.error(
      "check error variable in fileDataManager.upload code block\n",
      error
    );
    let uploadResult = result;
    if (error) {
      let message = "Unable to complete file submission.";
      res.status(500).json({ message: message });
      res.end();
    } else {
      //Update the file table inside the MySQL when the file image
      //has been saved at the cloud storage (Cloudinary)
      let imageURL = uploadResult.imageURL;
      let publicId = uploadResult.publicId;
      logger.info(
        "check uploadResult before calling createFileData in try block",
        uploadResult
      );
      try {
        let result = await fileDataManager.createFileData(
          imageURL,
          publicId,
          userId,
          designTitle,
          designDescription
        );
        logger.info(
          "Inspert result variable inside fileDataManager.uploadFile code"
        );
        logger.info(result);
        if (result) {
          let message = "File submission completed.";
          res.status(200).json({ message: message, imageURL: imageURL });
        }
      } catch (error) {
        let message = "File submission failed.";
        res.status(500).json({
          message: message,
        });
      }
    }
  });
}; //End of processDesignSubmission
exports.processGetSubmissionData = async (req, res, next) => {
  let pageNumber = req.params.pagenumber;
  let search = req.params.search;
  let userId = req.body.userId;
  try {
    let results = await fileDataManager.getFileData(userId, pageNumber, search);
    logger.info(
      "Inspect result variable inside processGetSubmissionData code\n",
      results
    );
    if (results) {
      var jsonResult = {
        number_of_records: results[0].length,
        page_number: pageNumber,
        filedata: results[0],
        total_number_of_records: results[2][0].total_records,
      };
      return res.status(200).json(jsonResult);
    }
  } catch (error) {
    let message = "Server is unable to process your request.";
    return res.status(500).json({
      message: error,
    });
  }
}; //End of processGetSubmissionData
exports.processGetSubmissionsbyEmail = async (req, res, next) => {
  let pageNumber = req.params.pagenumber;
  let search = req.params.search;
  let userId = req.body.userId;
  try {
    //Need to search and get the id information from the database
    //first. The getOneuserData method accepts the userId to do the search.
    let userData = await userManager.getOneUserDataByEmail(search);
    logger.info("Results in userData after calling getOneUserDataByEmail");
    logger.info(userData);
    if (userData) {
      let results = await fileDataManager.getFileDataByUserId(
        userData[0].user_id,
        pageNumber
      );
      logger.info(
        "Inspect result variable inside processGetSubmissionsbyEmail code\n",
        results
      );
      if (results) {
        var jsonResult = {
          number_of_records: results[0].length,
          page_number: pageNumber,
          filedata: results[0],
          total_number_of_records: results[2][0].total_records,
        };
        return res.status(200).json(jsonResult);
      } //Check if there is any submission record found inside the file table
    } //Check if there is any matching user record after searching by email
  } catch (error) {
    let message = "Server is unable to process your request.";
    return res.status(500).json({
      message: error,
    });
  }
}; //End of processGetSubmissionsbyEmail

exports.processGetUserData = async (req, res, next) => {
  let pageNumber = req.params.pagenumber;
  let search = req.params.search;

  try {
    let results = await userManager.getUserData(pageNumber, search);
    logger.info(
      "Inspect result variable inside processGetUserData code\n",
      results
    );
    if (results) {
      var jsonResult = {
        number_of_records: results[0].length,
        page_number: pageNumber,
        userdata: results[0],
        total_number_of_records: results[2][0].total_records,
      };
      return res.status(200).json(jsonResult);
    }
  } catch (error) {
    let message = "Server is unable to process your request.";
    return res.status(500).json({
      message: error,
    });
  }
}; //End of processGetUserData

exports.processGetOneUserData = async (req, res, next) => { //iwanthere
  let recordId = req.params.recordId;
  let token = req.headers.authorization.split(" ")[1];
  let decoded = jwt.decode(token);
  if (decoded.id == req.headers.user) {
    try {
      let results = await userManager.getOneUserData(recordId);
      logger.info(
        "Inspect result variable inside processGetOneUserData code\n",
        results
      );
      if (results) {
        var jsonResult = {
          userdata: results[0],
        };
        return res.status(200).json(jsonResult);
      }
    } catch (error) {
      let message = "Server is unable to process your request.";
      return res.status(500).json({
        message: error,
      });
    }
  } else {
      return res.status(403).json({message: "Unauthorized"})
  }
}; //End of processGetOneUserData

exports.processUpdateOneUser = async (req, res, next) => {
  let token = req.headers;

  logger.info("processUpdateOneUser running");
  //Collect data from the request body
  let recordId = req.body.recordId;
  let newRoleId = req.body.roleId;
  try {
    results = await userManager.updateUser(recordId, newRoleId);
    logger.info(results);
    return res.status(200).json({ message: "Completed update" });
  } catch (error) {
    logger.info(
      "processUpdateOneUser method : catch block section code is running"
    );
    logger.error(
      error,
      "======================================================================="
    );
    return res
      .status(500)
      .json({ message: "Unable to complete update operation" });
  }
}; //End of processUpdateOneUser

exports.processGetOneDesignData = async (req, res, next) => {
  //getonedesign

  let recordId = req.params.fileId;
  logger.info(recordId);
  try {
    let results = await userManager.getOneDesignData(recordId);
    logger.info(
      "Inspect result variable inside processGetOneFileData code\n",
      results
    );
    if (results[0].created_by_id == req.headers.user) {
      if (results) {
        var jsonResult = {
          filedata: results[0],
        };
        return res.status(200).json(jsonResult);
      }
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }
  } catch (error) {
    let message = "Server is unable to process the request.";
    return res.status(500).json({
      message: error, // poor error handling
    });
  }
}; //End of processGetOneDesignData

exports.processSendInvitation = async (req, res, next) => {
  let userId = req.body.userId;
  let recipientEmail = req.body.recipientEmail;
  let recipientName = validator.escape(req.body.recipientName);
  logger.info("userController processSendInvitation method's received values");
  logger.info(userId);
  logger.info(recipientEmail);
  logger.info(recipientName);

  try {
    //Need to search and get the user's email information from the database
    //first. The getOneuserData method accepts the userId to do the search.
    let userData = await userManager.getOneUserData(userId);
    logger.info(userData);
    let results = await userManager.createOneEmailInvitation(
      userData[0],
      recipientName,
      recipientEmail
    );
    if (results) {
      var jsonResult = {
        result: "Email invitation has been sent to " + recipientEmail + " ",
      };
      return res.status(200).json(jsonResult);
    }
  } catch (error) {
    logger.error(error);
    let message = "Server is unable to process the request.";
    return res.status(500).json({
      message: message,
      error: error, // poor error handling
    });
  }
}; //End of processSendInvitation

exports.processUpdateOneDesign = async (req, res, next) => {
  logger.info("processUpdateOneFile running");
  //Collect data from the request body
  let fileId = req.body.fileId;
  let designTitle = removeTags(req.body.designTitle);

  let designDescription = removeTags(req.body.designDescription);
  try {
    results = await userManager.updateDesign(
      fileId,
      designTitle,
      designDescription
    );
    logger.info(results);
    return res.status(200).json({ message: "Completed update" });
  } catch (error) {
    logger.info(
      "processUpdateOneUser method : catch block section code is running"
    );
    logger.error(
      error,
      "======================================================================="
    );
    return res
      .status(500)
      .json({ message: "Unable to complete update operation" });
  }
}; //End of processUpdateOneDesign

function removeTags(str) {
  if (str === null || str === "") return false;
  else str = str.toString();
  return str.replace(/(<([^>]+)>)/gi, "");
}
