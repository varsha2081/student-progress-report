const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require("passport");
const flash = require('express-flash')
const Admin = require('./models/adminModel.js');
const {Subject,Student,Marks} = require('./models/studentModel.js');

const app = express();

const initializePassport = require('./passport-config');
initializePassport(passport);


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(flash())
app.use(session({
  secret: "our little secret.",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);



// const testSubject = new Subject({
//   name: "Maths",
//   code: "18CS19"
// });
// testSubject.save();

app.get('/', function(req, res){
    res.render("home.ejs");
});

app.get('/login',checkNotAuthenticated, function(req, res){
    res.render("login.ejs");
});

app.get('/register',checkNotAuthenticated,function(req, res){
    res.render("register.ejs");
});

app.get('/admin-dashboard',checkAuthenticated,function(req,res){
    res.render("adminDashboard.ejs");
});

app.post('/login',checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/admin-dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));


app.post('/register',checkNotAuthenticated,function(req,res){
    bcrypt.hash(req.body.password,10, function(err,hash){
        const newAdmin = new Admin({
        name: req.body.name,
        email: req.body.email,
        password: hash
    });
    newAdmin.save(function(err){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            res.redirect ("/login");
        }
    })
    });
});

app.post("/logout", checkAuthenticated,function(req,res){
    req.logout(req);
    res.redirect("/");
});

app.get("/admin-dashboard/manageSubjects",checkAuthenticated,function(res,res){
  const sub = Subject.find({},function(err,subs){
    if(err){
      console.log(err);
    } else{
      res.render("manageSubjects.ejs",{subs:subs});
    }
  });
});

app.post("/admin-dashboard/manageSubjects",checkAuthenticated,function(req,res){
  const subName = req.body.name;
  const code = req.body.code;
  Subject.findOne({code:code},function(err,sub){
    if(err){
      console.log(err);
      res.redirect("/admin-dashboard");
    }else{
      if(sub==null){
        const newsub = Subject({
          name:subName,
          code:code
        });
        newsub.save();
        res.redirect("/admin-dashboard/manageSubjects");
      }else{
        Subject.updateOne({code:code},{name:subName},function(err,result){
          if(err){
            console.log(err);
            res.redirect("/admin-dashboard");
          }else{
            // console.log(result);
            res.redirect("/admin-dashboard/manageSubjects");
          }
        });
        
      }
    }
  })
});


app.get("/admin-dashboard/manageStudents",checkAuthenticated,function(res,res){
  const sub = Student.find({},function(err,subs){
    if(err){
      console.log(err);
    } else{
      res.render("manageStudents.ejs",{stud:subs});
    }
  });
});



app.post("/admin-dashboard/manageStudents",checkAuthenticated,function(req,res){
  const studName = req.body.studentName;
  const usn = req.body.usn;
  Student.findOne({usn:usn},function(err,sub){
    if(err){
      console.log(err);
      res.redirect("/admin-dashboard");
    }else{
      if(sub==null){
        const newsub = Student({
          name:studName,
          usn:usn
        });
        newsub.save();
        res.redirect("/admin-dashboard/manageStudents");
      }else{
        Student.updateOne({usn:usn},{name:studName},function(err,result){
          if(err){
            console.log(err);
            res.redirect("/admin-dashboard");
          }else{
            // console.log(result);
            res.redirect("/admin-dashboard/manageStudents");
          }
        });
        
      }
    }
  })
});

app.get("/admin-dashboard/manageMarks",checkAuthenticated,function(req,res){
  res.render("manageMarks.ejs");
});

app.post("/admin-dashboard/manageMarks",checkAuthenticated,function(req,res){
  const usn = req.body.usn;
  const code = req.body.code;
  const marks = req.body.marks;
  const attendance = req.body.attendance;

  Student.findOne({usn:usn},function(err,stud){
    if(err){
      console.log(err);
      res.redirect("/admin-dashboard");
    }else{
      if(stud==null){
        console.log("student not found");
        res.redirect("/admin-dashboard/manageStudents")
      }else{
        Subject.findOne({code:code},function(err,sub){
          if(err){
            console.log(err);
            res.redirect("/admin-dashboard");
          }else{
            if(sub==null){
              console.log("subject not found");
              res.redirect("/admin-dashboard/manageSubjects");
            }else{
              const subId = sub._id;
              const newmarks = new Marks({
                subject:subId,
                marks:marks,
                attendance:attendance,
                updatedBy: req.user._id
              });
              Student.updateOne({_id:stud._id},{$push:{marks:newmarks}},function(err,results){
                if(err){
                  console.log(err);
                  res.redirect("/admin-dashboard");
                }
              });
              Student.findOne({usn:usn}).populate("subject").populate("updatedBy","name").exec(function(err,updatedStudent){
                    if(err){
                      console.log(err);
                    }else{
                      res.redirect("/admin-dashboard/manageMarks");
                    }
                  });
            }
          }
        });
      }
    }
  });
});

// app.get("/results",function(req,res){
//   res.render("results.ejs",{stud:stud});
// });

app.post("/results",function(req,res){
  const usn = req.body.usn;
  Student.findOne({usn:usn},function(err,stud){
    if(err){
      console.log(err);
      res.redirect("/");
    }else{
      console.log(stud);
      res.render("results.ejs",{stud:stud});
    }
  })
});












function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/admin-dashboard');
  }
  next()
}


app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
