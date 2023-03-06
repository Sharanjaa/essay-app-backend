const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "elanguagecenter23@gmail.com",
    pass: "zfprojhsmxwkdjxc",
  }
});
exports.transporter = transporter;
