require("dotenv").config();
const jwt = require("jsonwebtoken");
const { SECRET } = process.env;

//this is a middleware function that checks if the user is authenticated

module.exports = {
  isAuthenticated: (req, res, next) => {
    const headerToken = req.get("Authorization");

    //if there is no token, send a 401 status code
    if (!headerToken) {
      console.log("ERROR IN auth middleware");
      res.sendStatus(401);
    }
    //if there is a token, verify it's valid
    let token;

    try {
      token = jwt.verify(headerToken, SECRET);
    } catch (err) {
      err.statusCode = 500;
      throw err;
    }
    //if the token is not verified, send a 401 status code
    if (!token) {
      const error = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }

    //if the token is verified, set the userId on the request object and call next().What does next() do? It calls the next middleware function in the chain, which is the controller function that was called in the route.

    next();
  },
};
