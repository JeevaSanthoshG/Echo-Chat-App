const sgMail = require("@sendgrid/mail");

const dotenv = require("dotenv");

dotenv.config({path: "../config.env"});

sgMail.setApiKey(process.env.SG_KEY);

const sendSGMail = async({
    recipient,
    sender,
    subject,
    html,
    text,
    attachments,
}) => {
    try {
        
        const from = sender || "contact@echochat.in";
        
        const msg = {
            to: "gjeevasanthosh@gmail.com", // email of recipient
            from: "kavin38502@gmail.com", //this will be our verified sender
            subject,
            html: html,
            text: text,
            attachments,
        };

        return sgMail.send(msg);

    } catch (error) {
        
    }
};

exports.sendEmail = async (args) => {
    if (process.env.NODE_ENV === "development") {
        return Promise.resolve();
    } else {
        return sendSGMail(args);
    }
}
