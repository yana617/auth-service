const nodemailer = require('nodemailer');

const { TEXTS } = require('../translations');

const {
  EMAIL_LOGIN,
  EMAIL_PASSWORD,
  TRANSPORT_HOST,
  TRANSPORT_PORT,
} = process.env;

const transporter = nodemailer.createTransport({
  port: TRANSPORT_PORT,
  host: TRANSPORT_HOST,
  auth: {
    user: EMAIL_LOGIN,
    pass: EMAIL_PASSWORD,
  },
  secure: true,
});

exports.sendLinkEmail = async (link, email) => transporter.sendMail({
  from: EMAIL_LOGIN,
  to: email,
  subject: TEXTS.EMAIL_SUBJECT_LINK,
  html: `<b>${TEXTS.HELLO}</b>
    <br>${TEXTS.RESET_LINK}:<br/>
    <a href='${link}'>${TEXTS.OPEN_LINK}</a>`,
});

exports.sendPasswordChangedSuccessfullyEmail = async (email) => transporter.sendMail({
  from: EMAIL_LOGIN,
  to: email,
  subject: TEXTS.EMAIL_SUBJECT_SUCCESS,
  text: TEXTS.EMAIL_SUCCESS_DESCRIPTION,
});
