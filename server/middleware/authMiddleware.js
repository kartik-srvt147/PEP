import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  // Read JWT from the 'jwt' cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user to the request, excluding the password
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user no longer exists'));
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

export { protect };
