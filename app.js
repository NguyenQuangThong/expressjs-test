const express = require("express");
const port = 3001;
const app = express();
const bodyParser = require("body-parser");
const routes = require("./routes/index");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(routes);

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
app.listen(process.env.PORT || port);
console.log("Server on port: " + port);
