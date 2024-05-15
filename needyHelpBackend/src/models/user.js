const { Schema, model } = require('../db/connection');
const jwt = require("jsonwebtoken");
const { accessSecretKey, refreshSecretKey } = require('../../config');
const { accessTokenExpiryTime, refreshTokenExpiryTime } = require('../utils/constants');

const UserSchema = new Schema({
    username: {type: String, required: true},
    emailId: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    refreshtoken: [String],
});

UserSchema.methods.generateAuthToken = function () {
    const accesstoken = jwt.sign(
      { _id: this._id },
      accessSecretKey,
      {
        expiresIn: accessTokenExpiryTime,
      }
    );
    const refreshtoken = jwt.sign(
      { _id: this._id },
      refreshSecretKey,
      { expiresIn: refreshTokenExpiryTime }
    );
  
    const tokens = { accesstoken: accesstoken, refreshtoken: refreshtoken };
    return tokens;
  };

const User = model("User", UserSchema);

module.exports = User;