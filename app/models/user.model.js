module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    username: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    is_lifetime_member: {
      type: Sequelize.BOOLEAN,
    },
    is_payment_complete: {
      type: Sequelize.BOOLEAN
    },
    success_count: {
      type: Sequelize.INTEGER
    },
    is_user_confirmed: {
      type: Sequelize.BOOLEAN
    }
  });

  return User;
};
