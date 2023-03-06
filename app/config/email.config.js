const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "essayapptestuser1@gmail.com",
    pass: "argtfnqjnswecfjs",
  }
});
exports.transporter = transporter;
