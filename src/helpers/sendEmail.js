const nodemailer = require('nodemailer');
const { envConstants } = require('./constants');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: envConstants.SMTP_HOST,
    port: envConstants.SMTP_PORT,
    auth: {
      user: envConstants.SMTP_EMAIL,
      pass: envConstants.SMTP_PASSWORD,
    },
    secure: true,
    requireTLS: true,
  });

  console.log(transporter);
  const message = {
    from: `${envConstants.FROM_NAME} <${envConstants.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || inviteHTML(options.user),
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
}

module.exports = {
  sendEmail,
};

let inviteHTML = (user) => (`
  <!DOCTYPE html>
<html>
  <head>
    <title>Join Our Platform</title>
    <style type="text/css">
      body {
        background-color: #f5f5f5;
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .container {
        background-color: #ffffff;
        border: 1px solid #cccccc;
        border-radius: 16px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        margin: 2rem auto;
        max-width: 500px;
        padding: 2rem;
        text-align: center;
      }
      h1, h2, p {
        margin: 0;
      }
      h1 {
        color: #fdac3b;
        font-size: 2.5rem;
        font-weight: bold;
      }
      h2 {
        color: #333333;
        font-size: 1.8rem;
        font-weight: bold;
        margin-top: 2rem;
      }
      p {
        color: #666666;
        font-size: 1.4rem;
        margin-top: 1rem;
      }
      .button {
        background-color: #fdac3b;
        border: none;
        border-radius: 4px;
        color: #ffffff;
        display: inline-block;
        font-size: 1.4rem;
        margin-top: 2rem;
        padding: 1rem 2rem;
        text-decoration: none;
        transition: all 0.2s ease-in-out;
      }
      .button:hover {
        transform: scale(1.1);
      }
      .image-container {
        margin-top: 2rem;
        display: flex;
        justify-content: center;
      }
      .image {
        max-width: 100%;
        max-height: 100%;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome to Freelancer</h1>
      <h2>You're Invited</h2>
      <p>Hi,</p>
      <p>You've been invited to join Freelancer platform by your friend ${user.name}. We're excited to have you on board! Click the button below to create your account and start exploring our services.</p>
      <a href="https://sonar5858.github.io/freelancer-frontend/signup" class="button">Create Account</a>
      <div class="image-container">
        <img src="https://images.unsplash.com/photo-1551275073-f8adef647c1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1167&q=80" alt="Freelancer logo" class="image">
      </div>
    </div>
  </body>
</html>
`);
