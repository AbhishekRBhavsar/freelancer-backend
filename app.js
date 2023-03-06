const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const dbConn = require('./src/connection/db.connect');
const { envConstants } = require('./src/helpers/constants');

const app = express();
// const { getROLES } = require('./src/middleware/middleware');

dbConn.connect();

app.use(cors());
app.options('*', cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(logger('common', { skip: () => process.env.NODE_ENV === 'test' }));

app.use('/', express.static('./uploads'));
app.get('/', (req, res) => {
  res.statusCode = 302;
  res.setHeader('Location', `${envConstants.APP_HOST}:${envConstants.APP_PORT}/api-docs`);
  res.end();
});
// getROLES(); // to generate the ROLE object for role based authentication/authorization

require('./src/routes/routing').routes(app);

module.exports = app;

// app.post("/signup", async (req, res) => {
//   try {
//     // console.log({ verified: verifyGoogleToken(req.body.credential) });
//     if (req.body.credential) {
//       console.log(req.body);
//       const verificationResponse = await verifyGoogleToken(req.body.credential);
//       console.log(verificationResponse);
//       if (verificationResponse.error) {
//         return res.status(400).json({
//           message: verificationResponse.error,
//         });
//       }

//       const profile = verificationResponse?.payload;

//       DB.push(profile);

//       res.status(201).json({
//         message: "Signup was successful",
//         user: {
//           firstName: profile?.given_name,
//           lastName: profile?.family_name,
//           picture: profile?.picture,
//           email: profile?.email,
//           token: jwt.sign({ email: profile?.email }, "myScret", {
//             expiresIn: "1d",
//           }),
//         },
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       message: "An error occurred. Registration failed.",
//     });
//   }
// });

// app.post("/login", async (req, res) => {
//   try {
//     if (req.body.credential) {
//       const verificationResponse = await verifyGoogleToken(req.body.credential);
//       if (verificationResponse.error) {
//         return res.status(400).json({
//           message: verificationResponse.error,
//         });
//       }

//       const profile = verificationResponse?.payload;

//       const existsInDB = DB.find((person) => person?.email === profile?.email);

//       if (!existsInDB) {
//         return res.status(400).json({
//           message: "You are not registered. Please sign up",
//         });
//       }

//       res.status(201).json({
//         message: "Login was successful",
//         user: {
//           firstName: profile?.given_name,
//           lastName: profile?.family_name,
//           picture: profile?.picture,
//           email: profile?.email,
//           token: jwt.sign({ email: profile?.email }, process.env.JWT_SECRET, {
//             expiresIn: "1d",
//           }),
//         },
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       message: error?.message || error,
//     });
//   }
// });

// app.listen("5152", () => console.log("Server running on port 5152"));
