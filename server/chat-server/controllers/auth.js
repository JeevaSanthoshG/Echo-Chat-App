const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const mailService = require("../services/mailer");
const User = require("../models/user");
const filterObj = require("../utils/filterObj");
const { promisify } = require("util");

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

// Signup => register - sendOTP - verifyOTP

// https://api.echo.com/auth/register

// Register

exports.register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "password",
    "email"
  );

  const existing_user = await User.findOne({ email: email });

  if (existing_user && existing_user.verified) {
    res.status(400).json({
      status: "error",
      message: "Email is already in use, Please login.",
    });
  } else if (existing_user) {
    await User.findOneAndUpdate({ email: email }, filteredBody, {
      new: true,
      validateModifiedOnly: true,
    });

    // Generate OTP and send email to user
    req.userId = existing_user._id;
    next();
  } else {
    const new_user = await User.create(filteredBody);

    // Generate OTP and send email to user
    req.userId = new_user._id;
    next();
  }
};

// Send OTP

exports.sendOTP = async (req, res, next) => {
  const { userId } = req;
  const new_otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const otp_expiry_time = Date.now() + 10 * 60 * 1000; // 10 mins after otp send

  await User.findByIdAndUpdate(userId, {
    otp: new_otp,
    otp_expiry_time,
  });

  // send mail
  mailService.sendEmail({
    from: "contact@echochat.in",
    to: "example@gmail.com",
    subject: "OTP for echo",
    text: `your OTP is ${new_otp}. This is valid for 10 mins`,
  });
  

  res.status(200).json({
    status: "success",
    message: "OTP sent successfully!",
  });
};

// Verify OTP

exports.verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400).json({
      status: "error",
      message: "Email is invalid or OTP expired",
    });
  }

  if (!(await user.correctOTP(otp, user.otp))) {
    res.status(400).json({
      status: "error",
      message: "OTP is incorrect",
    });
  }

  //OTP is correct

  user.verified = true;
  user.otp = undefined;

  await user.save({ new: true, validateModifiedOnly: true });

  const token = signToken(user._id);

  res.status(200).json({
    status: "sucess",
    message: "OTP verified successfully",
    token,
  });
};

// Login

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      status: "error",
      message: "Both email and password are required",
    });
  }

  const userDoc = await User.findOne({ email: email }).select("+password");

  if (!user || !(await userDoc.correctPassword(password, userDoc.password))) {
    res.status(400).json({
      status: "error",
      message: "Email or password is incorrect",
    });
  }

  const token = signToken(userDoc._id);

  res.status(200).json({
    status: "sucess",
    message: "Logged in successfully",
    token,
  });
};

exports.protect = async (req, res, next) => {
  // 1) Getting token (JWT) and check if it's there

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    req.status(400).json({
      status: "error",
      message: "You are not logged In! Please log in to get access",
    });
    return;
  }

  // 2) Verification of token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exist

  const this_user = await User.findById(decoded.userId);

  if (!this_user) {
    res.status(400).json({
      status: "error",
      message: "The user doesn't exist",
    });
  }

  // 4) Check if user changed their password after token was issued

  if (this.user.changedPasswordAfter(decoded.iat)) {
    res.status(400).json({
      status: "error",
      message: "User recently update password! Please log in again",
    });
  }

  //
  req.user = this_user;
  next();
};

// Types of Routes -> Protected (Only logged in user can access these) & Unprotected

exports.forgotPassword = async (req, res, next) => {
  // 1) Get user email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).json({
      status: "error",
      message: "There is no user with given email address",
    });
    return;
  }

  // 2) Gemerate the random reset token
  const resetToken = user.createPasswordResetToken();

  const resetURL = `http://echo.com/auth/reset-password/?code=${resetToken}`;

  try {
    // TODO => Send   Email With Reset URl
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      satuts: "error",
      message: "There was an error sending the email, Please try again later.",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1) Get user based on token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.parms.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has expired or submission is out of time window
  if (!user) {
    res.status(400).json({
      status: "error",
      message: "Token is Invalid or Expired",
    });
    return;
  }

  // 3) Update users password and set resetToken & expiry to undefined

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 4) Log in the user and Send new JWT

  const token = signToken(userDoc._id);

  res.status(200).json({
    status: "sucess",
    message: "Password Reseted Successfully",
    token,
  });
};
