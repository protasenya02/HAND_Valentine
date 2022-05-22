const express = require("express");
const path = require("path");
var bodyParser = require('body-parser')
const { buildSetup, drawValentine } = require("./src/main.js");

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use((err, req, res, next) => {
    console.log('Error: ', err.message)
    res.statusCode = err.code;
    res.json({ message: err.message });
    res.end();
});

var jsonParser = bodyParser.json()

app.post("/mint", jsonParser, async (req, res, next) => {
    console.log("Request: ", req.body.wish);
    try {
        const metaHash = await drawValentine(req.body.wish);
        console.log('Hash: ', metaHash)
        res.json({metadataHash: metaHash});
        res.end();
    } catch(err) {
        next(err);
    }
});
  
buildSetup();

const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

app.listen(PORT, console.log(`Server started on port ${PORT}`))

