const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    name : String,
    price : String,
    category : String,
    userId : String,
    author : String

});
let BookModel = mongoose.model("books",bookSchema);
module.exports = BookModel