const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("http");
const cors = require("cors");
const app = express();
const port = 5000;
const sorting = require("./sorting.model");
const bodyParser = require("body-parser");
const querystring = require("querystring");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://Mellolian:Fljufk93@cluster0-yzney.mongodb.net/Fume?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => console.log("Connected"))
  .catch((err) => console.log(err));

const RiveGaucheSchema = new mongoose.Schema({
  name: { type: [String], text: true },
  price: {
    type: Number,
  },
});

const RiveGauche = mongoose.model("RiveGauche", RiveGaucheSchema, "RiveGauche");

app.get("/brands", (req, res) => {
  RiveGauche.aggregate([
    { $unwind: "$brand" },
    { $group: { _id: "$brand", count: { $sum: 1 } } },
    { $project: { brand: "$_id", count: 1 } },
  ])
    .then((products) =>
      res.send(
        products.sort((a, b) => {
          if (a.brand.toLowerCase() < b.brand.toLowerCase()) return -1;
          if (a.brand.toLowerCase() > b.brand.toLowerCase()) return 1;
          return 0;
        })
      )
    )
    .catch((err) => console.log(err));
});

app.get("/", (req, res) => {
  console.log(req.query.filter);
  RiveGauche.find(
    req.query.filter ? { brand: { $in: req.query.filter.split(",") } } : {}
  )
    .find({ rawPrice: { $gt: 0 } })
    .find(req.query.query ? { $text: { $search: req.query.query } } : {})
    .limit(12 * req.query.page)
    .then((products) => res.send(products))
    .catch((err) => console.log(err));
});

app.get("/total", (req, res) => {
  console.log(req.query);
  RiveGauche.find(
    req.query.filter ? { brand: { $in: req.query.filter.split(",") } } : {}
  )
    .find(req.query.query ? { $text: { $search: req.query.query } } : {})
    .then((products) => res.send(products.length.toString()))
    .catch((err) => console.log(err));
});

const server = createServer(app);
server.listen(port, () => console.log(`server is up on port ${port}`));
