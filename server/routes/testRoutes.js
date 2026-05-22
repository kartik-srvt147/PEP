import express from 'express';

const router = express.Router();

// @desc    Test API Connection
// @route   GET /api/test
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({ message: 'SmartStore AI API is running successfully!' });
});

export default router;
