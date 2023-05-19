require("dotenv").config();
const { SECRET } = process.env;
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createToken = (username, id) => {
  return jwt.sign(
    {
      username,
      id,
    },
    SECRET,
    {
      expiresIn: "2 days",
    }
  );
};

//If a user with the same username is found in the database, it means the username is already taken. So it sends a response with a 400 status code and a message 'cannot create user'.

module.exports = {
  register: async (req, res) => {
    try {
      const { username, password } = req.body;
      let foundUser = await User.findOne({ where: { username } });
      if (foundUser) {
        res.status(400).send("cannot create user");
      } else {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const newUser = await User.create({ username, hashedPass: hash });
        const token = createToken(
          newUser.dataValues.username,
          newUser.dataValues.id
        );
        console.log("TOOOOOOKEN", token);
        const exp = Date.now() + 1000 * 60 * 60 * 48;
        res.status(200).send({
          username: newUser.dataValues.username,
          userId: newUser.dataValues.id,
          token,
          exp,
        });
      }
    } catch (error) {
      console.log("ERROR IN register");
      console.log(error);
      res.sendStatus(400);
    }
  },


  //The function starts by trying to destructure the username and password properties from the body of the request (req.body). These two properties are likely passed from the client during a user registration event.

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

//Then it uses a User model to find if a user already exists with the provided username. User.findOne({where: {username}}) will search the database for a User where the username is equal to the username provided in the request body.

      let foundUser = await User.findOne({ where: { username } });
      if (foundUser) {
        const isAuthenticated = bcrypt.compareSync(
          password,
          foundUser.hashedPass
        );

        if (isAuthenticated) {
          const token = createToken(
            foundUser.dataValues.username,
            foundUser.dataValues.id
          );
          const exp = Date.now() + 1000 * 60 * 60 * 48;
          res.status(200).send({
            username: foundUser.dataValues.username,
            userId: foundUser.dataValues.id,
            token,
            exp,
          });
        } else {
          res.status(400).send("cannot log in");
        }
      } else {
        res.status(400).send("cannot log in");
      }
    } catch (error) {
      console.log("ERROR IN register");
      console.log(error);
      res.sendStatus(400);
    }
  },
};
