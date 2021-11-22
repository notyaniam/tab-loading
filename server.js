// create a server for the backend
const express = require("express");
const cors = require("cors");
const colors = require("colors");
const morgan = require("morgan");
const env = require("./config/env");

// initialize the express package
const app = express();

// managing cors
const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

// monitor request made to the server
if (env.ENV === "development") {
  app.use(
    morgan(
      ":method :url :status :total-time[digits]ms :date[iso] :remote-addr :user-agent"
    )
  );
}

app.get("/", (req, res) => res.send("Momentum close backend API"));

// section to handle routes
app.use("/api/quote", require("./routes/quote"));
app.use("/api/weather", require("./routes/weather"));

// start the server
app.listen(env.PORT, () =>
  console.log(`Server started on port: ${env.PORT}`.bold.green)
);
