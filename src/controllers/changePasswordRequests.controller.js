const path = require('path');
require('dotenv').config();
const {v4} = require('uuid');
const ChangePasswordRequest = require(path.join(__dirname, '..', 'models', 'changePasswordRequest.model'));
const User = require(path.join(__dirname, '..', 'models', 'user.model'));
const nodemailer = require('nodemailer');

const changePasswordController = {};

changePasswordController.createCode = async (req, res) => {
    try {
        const {email} = req.body;
        const code = v4();
        const abrevCode = code.slice(0, 6);

        const user = await User.findOne({email});
        if(!user) return res.status(404).send('No se ha encontrado el usuario.');

        const currentRequest = await ChangePasswordRequest.findOne({email: email});
        if(currentRequest) await ChangePasswordRequest.findByIdAndDelete(currentRequest._id);
        
        const newRequest = new ChangePasswordRequest({
            email, 
            code: abrevCode,
            state: 'in process'
        });

        const transporter = await nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const messageHtml = `    
        <div styles="border-radius: 20px;">
            <h1 style="padding: 10px; text-align: center; font-weight: 200;">Solicitud de cambio de contraseña</h1>
            <p style="font-size: 20px;  padding: 10px;">
                Hemos recibido una solicitud de cambio de contraseña para tu usuario de Duvi. Si crees que este correo es un error, por favor ignóralo. Por el contrario, usa el siguiente código
                en la ventana de <a style="font-size: 20px;" href="">duvi.com</a> para poder cambiar tu contraseña con éxito, recuerda distinguir entre mayúsculas y minúsculas. 
                Muchas gracias por confiar en nosotros! 
            </p>

            <h2 style="text-align: center; font-size: 50px; letter-spacing: 20px; color: #9767B7;">${newRequest.code}</h2>

            <p style="font-size: 20px;  padding: 10px;">
                Si no has solicitado este cambio de contraseña o tienes algún problema, no dudes en contactarnos mediante la sección de "ayuda" de la página principal o 
                enviando un correo electrónico a <a style="font-size: 20px;" href="">duviapp@eiche.cl</a>
            </p>
        </div>` 

        const emailSended = await transporter.sendMail({
            from: `'Duvi APP' <${process.env.MAIL_USERNAME}>`,
            to: newRequest.email,
            subject: 'Duvi APP - Solicitud de cambio de contraseña',
            html: messageHtml
        })

        console.log('Message sent: ', emailSended.messageId);

        await newRequest.save();

        res.status(201).send({
            image: user.userImage,
            userId: user._id
        });
    } catch (error) {
        console.log(error);
    }
};

changePasswordController.verifyCode = async (req, res) => {
    try {
        const {code, email} = req.body;
        const codeVerified = await ChangePasswordRequest.findOne({code, email});

        if(!codeVerified) return res.status(404).send("Código incorrecto! intenta nuevamente.");

        await ChangePasswordRequest.findByIdAndDelete(codeVerified._id);
        
        res.status(200).send({message: 'Código verificado.'});
    } catch (e) {
        console.log(e);
        res.status(500).send('Error inesperado');
    }
}

changePasswordController.changePassword = async (req, res) => {
    try {
        const {id} = req.params;
        const {newPassword} = req.body;

        const password = await User.encryptPassword(newPassword);

        const userUpdated = await User.findByIdAndUpdate(id, { password }, {new: true});

        res.status(200).send(userUpdated);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

module.exports = changePasswordController;