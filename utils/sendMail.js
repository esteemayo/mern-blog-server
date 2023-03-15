import nodemailer from 'nodemailer';

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `MERN Blog Team <${process.env.MAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  return await transporter.sendMail(mailOptions);
};

export default sendMail;
