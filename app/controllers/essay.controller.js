const OpenAIApi = require("openai").OpenAIApi;
const Configuration = require("openai").Configuration;

const config = require("../config/auth.config");
const db = require("../models");
const Essay = db.essay;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const configuration = new Configuration({
  apiKey: config.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


exports.signup = async (req, res) => {
  // Save User to Database
  // Essay.create({
  //   user_id: req.body.user_id,
  //   question: req.body.question,
  //   answer: req.body.answer
  // })
  // .then(async essay => {
  try {
    if (!configuration.apiKey) {
      res.status(500).json({
        error: {
          message: "OpenAI API key not configured, please follow instructions in README.md",
        }
      });
      return;
    } else {
      console.log(req)
      if (req.body.question.trim().length < 50) {
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
        temperature: 0.1,
        max_tokens: 1000,
      });
      res.status(200).json({ result: completion.data.choices[0].text });
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
  };

  function generatePrompt(question, answer, task) {
    return `Assses the IELTS ${task} test, give each band score and details, include the following 
    areas & include examples where appropriate:
  
     Further, always include the following in your response:
     
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
