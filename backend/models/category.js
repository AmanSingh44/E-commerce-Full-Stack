const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Category", categorySchema);
