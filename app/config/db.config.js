module.exports = {
  HOST: "essay-app.cgggbpkltesa.us-east-1.rds.amazonaws.com",
  USER: "admin",
  PASSWORD: "Test123456",
  DB: "testdb",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
