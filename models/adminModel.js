const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const adminSchema = new mongoose.Schema ({
  name: String,
  email: String,
  password: String,
});

const Admin = mongoose.model("Admin",adminSchema);

module.exports = Admin;