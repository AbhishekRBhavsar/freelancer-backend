const request = require('supertest');
const app = require('../app');
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const { OAuth2Client } = require('google-auth-library');
// const { jest } = require('jest');
// jest.mock('google-auth-library');

// const mockedVerifyIdToken = jest.fn().mockResolvedValue({
//   payload: {
//     email: 'johndoe@example.com',
//     given_name: 'John',
//     family_name: 'Doe',
//     picture: 'https://example.com/johndoe.jpg',
//   },
// });

// OAuth2Client.mockImplementation(() => ({
//   verifyIdToken: mockedVerifyIdToken,
// }));

// exports.OAuth2Client = OAuth2Client;

const { Users } = require('../src/model/users');
let mongoServer;

// describe('Signup API', () => {
//   // connect to MongoDB before running any tests
//   beforeAll(async () => {
//     mongoServer = await MongoMemoryServer.create();
//     const mongoUri = mongoServer.getUri();

//     // await mongoose.connect(mongoUri, {
//     //   useNewUrlParser: true,
//     //   useUnifiedTopology: true,
//     // });
//   });

//   afterAll(async () => {
//     await mongoose.disconnect();
//     await mongoServer.stop();
//   });

//   // clear the users collection after each test
//   afterEach(async () => {
//     await Users.deleteMany();
//   });

//   // test the signup function with valid credentials
//   it('should signup a user with valid credentials', async () => {
//     // mock the verifyIdToken method
//     const mockedVerifyIdToken = jest.fn().mockResolvedValue({
//       payload: {
//         email: 'johndoe@example.com',
//         given_name: 'John',
//         family_name: 'Doe',
//         picture: 'https://example.com/johndoe.jpg',
//       },
//     });

//     OAuth2Client.mockImplementation(() => ({
//       verifyIdToken: mockedVerifyIdToken,
//     }));

//     const response = await request(app)
//       .post('/api/v1/signup')
//       .send({
//         credential: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImFjZGEzNjBmYjM2Y2QxNWZmODNhZjgzZTE3M2Y0N2ZmYzM2ZDExMWMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2ODEzMTkxMjksImF1ZCI6IjEwMTEyNjgxNzQ0NTMtOTE3ZmR2amtpNGlhOXNkczFqdXRxbWZidGtyOGVrM20uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTM1ODQ5MTYwMTY2ODQ1MjkyNjUiLCJlbWFpbCI6ImtydXNoaXRkdWRoYXQyMDAxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhenAiOiIxMDExMjY4MTc0NDUzLTkxN2ZkdmpraTRpYTlzZHMxanV0cW1mYnRrcjhlazNtLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwibmFtZSI6ImtydXNoaXQgZHVkaGF0IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FHTm15eGEtZ09CUDVXNmJiNDYyeDVNYVpoMnJ5VWJxQjFFNFMtbXY1WnJNOHc9czk2LWMiLCJnaXZlbl9uYW1lIjoia3J1c2hpdCIsImZhbWlseV9uYW1lIjoiZHVkaGF0IiwiaWF0IjoxNjgxMzE5NDI5LCJleHAiOjE2ODEzMjMwMjksImp0aSI6ImUzZWRjMjE1MzY5MjFjYTE4ZGNlNzQ4MTRhNzcyNWYxZjViZDkyOGIifQ.PKrcpmvQ2G17dHtZBPNY3S6dbcNcuoRGs5jdMhhb2KdtiLeLc5JjtO6KXko76FvUWsugqRPLNE372rSq2WO9hs-CV1eTo_zed-NLj29T34KdA27BeHwBJ0ByUgWLOSpwzvnrkAwSycet0684zYT4YCoEpF4AZ_UTvW9EUlVexLOU54Z_M8cCIkMnTXQi84HwWkaj8QkUxncfvpKDT2kgTDsMjkbyqurrCD1XV-QxnVSVASSmpSeEgFnbuMVVR_dwW3m5MJbj1LRgTpkrvwdPm39kYMy_kFMFxGoORhHDK_WKFP4taApFVIux3tDs3WYYTaBqGnNJG1Nofg1fEkoNJw',
//         role: 'developer',
//       });

//     expect(response.statusCode).toBe(201);
//     expect(response.body.user.firstName).toBe('John');
//     expect(response.body.user.lastName).toBe('Doe');
//     expect(response.body.user.email).toBe('johndoe@example.com');
//     expect(response.body.user.role).toBe('client');
//     expect(response.body.token).toBeDefined();

//     // check that verifyIdToken was called with the correct token
//     expect(mockedVerifyIdToken).toHaveBeenCalledWith('valid_token');
//   });


//   // test the signup function with invalid credentials
//   it('should return an error message with invalid credentials', async () => {
//     const response = await request(app)
//       .post('/api/v1/signup')
//       .send({
//         credential: 'invalid_token',
//         role: 'developer',
//       });

//     expect(response.statusCode).toBe(400);
//     expect(response.body.message).toBe('Invalid credentials');
//   });

//   // test the signup function with an existing user
//   it('should update the user with the new googleAuth if the email already exists', async () => {
//     const existingUser = new Users({
//       email: 'johndoe@example.com',
//       firstName: 'John',
//       lastName: 'Doe',
//       picture: 'https://example.com/johndoe.jpg',
//       googleAuth: 'old_google_auth',
//       role: 'developer',
//     });
//     await existingUser.save();

//     const response = await request(app)
//       .post('/api/v1/signup')
//       .send({
//         credential: 'new_valid_token',
//         role: 'developer',
//       });

//     expect(response.statusCode).toBe(201);
//     expect(response.body.user.googleAuth).toBe('new_google_auth');
//   });
// });