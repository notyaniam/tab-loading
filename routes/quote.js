const express = require("express");
const { default: axios } = require("axios");

const router = express.Router();

// @route       GET /api/quote
// @desc        get a new quote
// @category    public route
const getNewQuote = async (req, res) => {
  const response = await axios.get("https://zenquotes.io/api/random/");
  res.json(response.data);
};

router.get("/", getNewQuote);

module.exports = router;
