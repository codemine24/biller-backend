// import nodemailer from "nodemailer";
// import config from "../../config";

// const emailSender = async (
//   receiverEmail: string,
//   html: string,
//   subject: string
// ) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // Use `true` for port 465, `false` for all other ports
//     auth: {
//       user: config.app_email_address,
//       pass: config.email_app_pass,
//     },
//   });

//   const info = await transporter.sendMail({
//     from: `"Techtong" <${config.app_email_address}>`,
//     to: receiverEmail,
//     subject: subject,
//     html,
//   });
//   return info;
// };

// export default emailSender;
