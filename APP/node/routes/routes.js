import express from 'express'
import { getRoles } from '../controllers/RoleController.js'
import { createUser, deleteUserFromWallet, returnUserAndRole } from '../controllers/UserController.js'
import { sendMail } from './mail.js'
import { ethers } from 'ethers'
import { finishAgreement } from '../controllers/AgreementController.js'
const router = express.Router()

router.get('/getRoles', getRoles)
router.post('/registerUser', createUser)
router.post('/sendmail', sendMail)
router.post('/revertCreate', async (req, res) => {
    const { wallet, signature } = req.body;
    const originalMessage = `Ha ocurrido un error y confirme para revertir la operación de creación de la cuenta ${wallet} e intentelo de nuevo`
    try {

        const signingAddress = ethers.verifyMessage(originalMessage, signature);

        if (signingAddress.toLowerCase() === wallet.toLowerCase()) {
            await deleteUserFromWallet(wallet)
            res.status(200).json({ message: "User remove successfully." });
        } else {
            res.status(401).json({ error: "Verification failed." });
        }
    } catch (error) {
        console.error('Error during hash comparison:', error);
        res.status(500).json({ error: "Internal server error." });
    }
});
router.post('/smartFinishAgreement', async (req, res) => {
    try {
        await finishAgreement(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})

export default router
