import Mailgen from 'mailgen'
import nodemailer from 'nodemailer'

const sendMail = async (options) => {

    //To craft the mail, we are using Mailgen
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Task-Manager',
            link: 'https://mailgen.js/'
        }
    });

    // Generate an HTML email with the provided contents
    var emailHTML = mailGenerator.generate(options.mailGenContent);
    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    var emailText = mailGenerator.generatePlaintext(options.mailGenContent);


    // Create a nodemailer transporter instance which is responsible to send a mail
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });


    const mail = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: emailText, // plain‑text body
        html: emailHTML, // HTML body
    }

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        // As sending email is not strongly coupled to the business logic it is not worth to raise an error when email sending fails
        // So it's better to fail silently rather than breaking the app
        console.error(
            "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file",
        );
        console.error("Error: ", error);
    }
}


const emailVerificationMailGen = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to our App!! We\'re very excited to have you on board.',
            action: {
                instructions: "To verify your email please click on the following button:",
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Verify your email',
                    link: verificationUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

const forgotPasswordMailGen = (username, forgotPasswordUrl) => {
    return {
        body: {
            name: username,
            intro: 'You are receiving this email because we received a password reset request for your account.',
            action: {
                instructions: 'To reset the password, please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Reset Password',
                    link: forgotPasswordUrl
                }
            },
            outro: 'If you did not request a password reset, no further action is required.'
        }
    }
}

const apiKeyMailGen = (username, apikey) => {
    return {
        body: {
            name: username,
            intro: 'Your API key has been successfully generated. ',
            action: {
                instructions: `Please store it securely as this is the only time it will be shown to you. 🔑 Your API Key: ${apikey}`,
                button: {}
            },
            outro: 'Keep this key safe — it allows access to your projects and tasks via our API.'
        }
    }
}




export { sendMail, emailVerificationMailGen, forgotPasswordMailGen, apiKeyMailGen }