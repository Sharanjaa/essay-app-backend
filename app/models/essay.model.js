module.exports = (sequelize, Sequelize) => {
  const Essay = sequelize.define("essay", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    question: {
      type: Sequelize.STRING
    },
    answer: {
      type: Sequelize.STRING
    },
    user_id: {
      type: Sequelize.INTEGER
    }
  });

  return Essay;
};
