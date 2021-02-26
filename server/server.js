const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const jsonParser = bodyParser.json();
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse requests of content-type - application/json
app.use(jsonParser);


// simple route
app.get("/", (req, res) => {
  res.json({ message: "This is BOJA App Server." });
});

require("./routes/index.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});