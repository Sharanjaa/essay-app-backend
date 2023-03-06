const OpenAIApi = require("openai").OpenAIApi;
const Configuration = require("openai").Configuration;

const { transporter } = require("../config/email.config");

const config = require("../config/auth.config");
const db = require("../models");
const Essay = db.essay;
const User = db.user;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const configuration = new Configuration({
  apiKey: config.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


exports.submitEssay = async (req, res) => {
  // Save User to Database
  Essay.create({
    user_id: req.body.user_id,
    question: req.body.question,
    answer: req.body.answer
  })
    .then(async essay => {
      try {
        if (!configuration.apiKey) {
          res.status(500).json({
            error: {
              message: "OpenAI API key not configured, please follow instructions in README.md",
            }
          });
          return;
        } else {
          if (req.body.question.trim().length < 10) {
            res.status(400).json({
              error: {
                message: "Please enter a valid question",
              }
            });
            return;
          }
          if (req.body.answer.trim().length < 50) {
            res.status(400).json({
              error: {
                message: "Please enter a valid essay",
              }
            });
            return;
          }
          const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: generatePrompt(req.body.question, req.body.answer, req.body.task),
            temperature: 0.5,
            max_tokens: 3000,
          });

          const currentUser = await User.findOne({
            where: {
              id: req.body.user_id
            }
          });

          const { year, month, date } = generateDate();
          //modifying the related field
          currentUser.success_count = currentUser.success_count + 1;
          //saving the changes
          currentUser.save({ fields: ['success_count'] });
          const mailOptions = getEmailOptions(currentUser, completion, year, month, date);
          res.status(200).json({
            result: completion.data.choices[0].text
          });
          await transporter.sendMail(mailOptions);
        }
      } catch (error) {
        // Consider adjusting the error handling logic for your use case
        if (error.response) {
          console.error(error.response.status, error.response.data);
          res.status(error.response.status).json(error.response.data);
        } else {
          console.error(`Error with OpenAI API request: ${error}`);
          res.status(500).json({
            error: {
              message: 'An error occurred during your request.',
            }
          });
        }
      }
    })
    .catch(err => {
      console.error(`Error with request: ${err}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    });

  function getEmailOptions(currentUser, completion, year, month, date) {
    return {
      from: 'essayapptestuser1@gmail.com',
      to: currentUser.email,
      subject: 'Your Proficiency Results from the e-Language Center',
      html: `<!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Your Language Proficiency Results</title>
            </head>
            <body>
              <p>Hi ${currentUser.username},</p>
              <p>Thank you for submitting your question to the E-Language Center. Here is a summary of your submission:</p>
              <ul>
                <li>Question: ${req.body.question}</li>
                <li>Submitted Answer: ${req.body.answer}</li>
                <li>Generated Results: ${completion.data.choices[0].text}</li>
                <li>Submitted Date: ${year}-${month}-${date}</li>
              </ul>
              <p>Thank you for using the E-Language Center!</p>
              <p>Best regards,</p>
              <p>The E-Language Center Team</p>
            </body>
          </html>`
    };
  }

  function generateDate() {
    const ts = Date.now();

    const date_time = new Date(ts);
    const date = date_time.getDate();
    const month = date_time.getMonth() + 1;
    const year = date_time.getFullYear();
    return { year, month, date };
  }

  function generatePrompt(question, answer, task) {
    return `Assses the ${task} very strictly like if you were in a very bad mood but venting out your superiority.
    
    Further, always include the band score, detailed inaccuracies and corrective measures with examples under the following areas:
     
     - Overall Bandscore:
     - Task Achievement:
     - Grammatical Range and Accuracy:
     - Lexical Resource:
     - Coherence and Cohesion:
     - Areas to improve: If there are no areas to improve, then skip this point
    
    Question: '${question}'
    
    Answer: '${answer}.'`;
  }

};
