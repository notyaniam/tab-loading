const express = require("express");
const config = require("config");
const { default: axios } = require("axios");

const router = express.Router();

// @route       GET /api/weather
// @desc        get new weather current
// @category    public route
const getNewWeather = async (req, res) => {
  try {
    // get api key from the config
    const key = config.get("weatherAPIKey");
    // check if there's a location in request else default
    const loc = req.query.loc || "nyeri";
    // create api url
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=metric&appid=${key}`;

    // get and retur data
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res.json(err);
  }
};

// format request route
router.get("/", getNewWeather);

module.exports = router;
