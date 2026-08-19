// import passport from 'passport';
// import { Strategy as LocalStrategy } from 'passport-local';


// // Example user DB (replace with real DB)


// passport.use(new LocalStrategy(
//   { usernameField: 'email' },
//   (email, password, done) => {
//     const user = users.find(u => u.email === email);
//     if (!user || user.password !== password) {
//       return done(null, false, { message: 'Incorrect credentials.' });
//     }
//     return done(null, user);
//   }
// ));

// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser((id, done) => {
//   const user = users.find(u => u.id === id);
//   done(null, user);
// });

// export default passport;