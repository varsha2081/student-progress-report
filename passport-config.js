const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');
const Admin = require('./models/adminModel.js');


function initialize(passport) {
  const authenticateUser = (email, password, done) => {
    Admin.findOne({email:email},function(err,user){
        if(err){
            console.log(err);
            return done(err,false);
        }
        if (user == null) {
          return done(null, false, { message: 'No user with that email' })
        }
        if (bcrypt.compare(password, user.password)) {
            return done(null, user)
        } else {
            return done(null, false, { message: 'Password incorrect' })
        }

    });
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser(function(id, done) {
  Admin.findById(id, function(err, user) {
    done(err, user);
  });
});
}

module.exports = initialize