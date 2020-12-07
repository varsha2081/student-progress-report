const mongoose = require("mongoose");
const Admin = require('./adminModel.js');


mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const subjectSchema  = new Schema({
name: {
        type: String,
        required: true
    },
code: {
    type:String,
    required: true
    },
});

const Subject = mongoose.model("Subject", subjectSchema);

const MarksSchema  = new Schema({
    subject: {type:Schema.Types.ObjectId, ref:"Subject"},
    marks: {
        type: Number,
        required: true
    },
    attendance: {
        type: Number,
        required: true
    },
    updatedBy: {type:Schema.Types.ObjectId, ref:"Admin"}
});

const Marks = mongoose.model("marks",MarksSchema);

const studentSchema  = new Schema({
  name :{
      type  : String,
      required : true
  } ,
  usn:{
      type: String,
      required: true
  },
  marks: [MarksSchema]

});
const Student = mongoose.model('Student',studentSchema);

module.exports = {Subject,Student,Marks}