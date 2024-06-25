import formData from 'form-data'
import Mailgun from 'mailgun.js';
import dotenv from 'dotenv'
dotenv.config();
export const sendMail = (to, subject, content) => {
    const mailgun = new Mailgun(formData);

    const mg = mailgun.client({ username: 'api', key: process.env['API_KEY_MAIL'], url: 'https://api.mailgun.net/' });

    mg.messages.create('sandbox2cd7b6e40ae14091bf8bea4724c52718.mailgun.org', {
        from: "mateujpuib@gmail.com",
        to: [to],
        subject: subject,
        text: content,
    })
        .then(msg => console.log(msg))
        .catch(err => console.log(err));


}