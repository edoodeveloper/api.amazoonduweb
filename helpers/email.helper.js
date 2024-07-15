const nodemailer = require('nodemailer');

// Configurer le transporteur SMTP pour Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'big.and.doors@gmail.com',
    pass: 'dspx pmsu pwui mzjp',
  },
});

const sendResetPasswordEmail = (email, resetLink) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: 'big.and.doors@gmail.com',
      to: email,
      subject: 'Réinitialisation de mot de passe',
      html: `<p>Vous avez demandé une réinitialisation de mot de passe. 
      Veuillez cliquer sur ce <a href="${resetLink}">lien</a> pour réinitialiser votre mot de passe.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error); // Rejeter la promesse en cas d'erreur
      } else {
        resolve(info); // Résoudre la promesse avec les informations de réussite
      }
    });
  });
};

module.exports = { sendResetPasswordEmail };