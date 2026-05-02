const { Schema, model } = require('../db/connection');
const jwt = require("jsonwebtoken");
const { accessSecretKey, refreshSecretKey } = require('../../config');
const { accessTokenExpiryTime, refreshTokenExpiryTime } = require('../utils/constants');

const ROLES = ['donor', 'student', 'teacher', 'admin'];

const UserSchema = new Schema({
    username: { type: String, required: true, trim: true },
    emailId:  { type: String, unique: true, required: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },

    role: { type: String, enum: ROLES, default: 'donor', index: true },
    verified: { type: Boolean, default: false }, // teachers/posters need admin verification
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    phone: { type: String, default: '', trim: true },     // +91XXXXXXXXXX
    district: { type: String, default: '', trim: true, index: true }, // TN district
    pincode: { type: String, default: '', trim: true, match: /^(\d{6})?$/ },
    language: { type: String, enum: ['en', 'ta'], default: 'en' },

    refreshtoken: [String],
}, { timestamps: true });

UserSchema.methods.generateAuthToken = function () {
    const accesstoken = jwt.sign(
      { _id: this._id, role: this.role },
      accessSecretKey,
      { expiresIn: accessTokenExpiryTime }
    );
    const refreshtoken = jwt.sign(
      { _id: this._id },
      refreshSecretKey,
      { expiresIn: refreshTokenExpiryTime }
    );
    return { accesstoken, refreshtoken };
};

UserSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        username: this.username,
        emailId: this.emailId,
        role: this.role,
        verified: this.verified,
        avatarUrl: this.avatarUrl,
        bio: this.bio,
        phone: this.phone,
        district: this.district,
        pincode: this.pincode,
        language: this.language,
        createdAt: this.createdAt,
    };
};

const User = model("User", UserSchema);

module.exports = User;
module.exports.ROLES = ROLES;