const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { use } = require("express/lib/application");

const { transporter } = require("../config/email.config");

exports.signup = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(async user => {
      const mailOptions = getEmailOptions(user.username, user.email, 'https://api.elanguagecenter.com/api/auth/activate?user_id=' + encodeURIComponent(user.id));
      res.send({ message: "To activate your account, please check your email" })
      await transporter.sendMail(mailOptions);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!user.is_user_confirmed) {
        return res.status(401).send({
          accessToken: null,
          message: "To activate your account, please check your email!"
        });
      }

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      res.status(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: authorities,
        is_lifetime_member: user.is_lifetime_member,
        is_payment_complete: user.is_payment_complete,
        success_count: user.success_count,
        accessToken: token,
      })
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.activate = async (req, res) => {
  try {
    const userId = decodeURIComponent(req.query.user_id)

    const currentUser = await User.findOne({
      where: {
        id: userId
      }
    });
    //modifying the related field
    currentUser.is_user_confirmed = true;
    //saving the changes
    currentUser.save({ fields: ['is_user_confirmed'] });
    res.status(200).json({
      result: "success"
    });

  } catch (err) {
    console.error(`Error with user update request: ${err}`);
    res.status(500).json({
      error: {
        message: 'An error occurred during your request.',
      }
    });
  }
};

function getEmailOptions(username, email, activation_url) {
  return {
    from: 'essayapptestuser1@gmail.com',
    to: email,
    bcc: 'bacyus2021@gmail.com',
    subject: `ELanguage Center - Your Activation Email : ${username}`,
    html: `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>ELanguage Center - Your Activitation : ${username}</title>
          </head>
          <body>
            <p>Hi ${username},</p>
            <p>Thank you for registering with our service. To activate your account, please click on the button below:</p>
            <p><a href="${activation_url}"><button style="background-color: #4CAF50; color: white; padding: 14px 20px; border: none; border-radius: 4px; cursor: pointer;">Activate Your Account</button></a></p>
            <p>If you did not register with our service, please ignore this email.</p>
            <p>Thank you for using the E-Language Center!</p>
            <p>Best regards,</p>
            <p>The E-Language Center Team</p>
          </body>
        </html>`
  };
}
