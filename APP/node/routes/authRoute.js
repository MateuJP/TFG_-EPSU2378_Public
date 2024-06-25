import { Router } from "express";
import { ethers } from 'ethers'
import { SignJWT, jwtVerify } from 'jose';
import { configJWT } from "../config/index.js";
import { loginValidationRules } from "../help/index.js";
import { validationResult } from "express-validator";
import { changePassword, getUser, returnUserAndRole, updatePermisions, updateUser, viewProfile } from "../controllers/UserController.js";
import { addSmartMeter, getAddressSmartMeter, getSmartMetersFromUser, removeSmartMeter, updateSmartMeter } from "../controllers/SmartMeterController.js";
import { InsertPersonalNotfication, getActiveChats, getFullChatWithUser, getPersonalNotificationsfromSystem, markNotificationPersonalAsReaded } from "../controllers/NotificationPersonalController.js";
import { insertBroadcatNotification } from "../controllers/NotificationBroadcstController.js";
import { getBroadcastnotifications, insertUserToBroadcastNotification, markNotificationBroadcastAsReaded } from "../controllers/NotificationBroadcastUserController.js";
import { InsertMarketOffer, UpdateAmountMarketOffer, UpdateAvaliableOffer, deleteMarketOffer, deleteMarketOfferSystem, getMarketOffer, getNotRevealOffersFromProducer, getOfferFromProducer } from "../controllers/MarketOfferController.js";
import { createAgreement, finishAgreement, getAgreementFromContract, getAllUserAgreements } from "../controllers/AgreementController.js";


// Midedleware to validate authorization token and user role for post conections
const validateTokenAndEntry = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).json({ message: "Usuario No Autorizado" });
    try {
        const enconder = new TextEncoder();
        const { payload } = await jwtVerify(
            authorization,
            enconder.encode(configJWT.private_key)
        );
        if (!payload.idUser) {
            return res.sendStatus(403).json("No Autorizado")
        }
        const erros = validationResult(req);
        if (!erros.isEmpty()) return res.status(400).json({ message: "Error en la entrada de datos" });
        req.idUser = payload.idUser;
        next();
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

}
// Midedleware to validate authorization token and user owner for post conections
const validateTokenAndOwner_Post = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).json({ message: "Usuario No Autorizado" });
    try {
        const enconder = new TextEncoder();
        const { payload } = await jwtVerify(
            authorization,
            enconder.encode(configJWT.private_key)
        );
        if (payload.idUser != req.body.idUser) {
            return res.sendStatus(403).json("No Autorizado")
        }
        const erros = validationResult(req);
        if (!erros.isEmpty()) return res.status(400).json({ message: "Error en la entrada de datos" });
        next();
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

}
// Midedleware to validate authorization token and user owner for Get conections
const validateTokenAndOwner_Get = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).json({ message: "Usuario No Autorizado" });
    try {
        const enconder = new TextEncoder();
        const { payload } = await jwtVerify(
            authorization,
            enconder.encode(configJWT.private_key)
        );
        if (payload.idUser != req.params.idUser) {
            return res.sendStatus(403).json("No Autorizado")
        }
        const erros = validationResult(req);
        if (!erros.isEmpty()) return res.status(400).json({ message: "Error en la entrada de datos" });
        next();
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

}
// Midedleware to validate authorization token and if user is admin

const validateTokenAdmin = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).json({ message: "Usuario No Autorizado" });
    try {
        const enconder = new TextEncoder();
        const { payload } = await jwtVerify(
            authorization,
            enconder.encode(configJWT.private_key)
        );
        if (payload.isAdmin != 1) {
            return res.sendStatus(403).json("No Autorizado")
        }
        next();
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }


}
const authRouter = Router();

/**
 * check if the token of the user is valid
 */
authRouter.post('/checkToken', validateTokenAndEntry, async (req, res) => {
    const resp = await returnUserAndRole(req.idUser)
    if (resp != null) {
        return res.status(200).json(resp);
    } else {
        return res.status(500)
    }
})
/**
 * Handles the login endpoint, validating user credentials and returning a JWT token upon successful login.
 * Utilizes loginValidationRules for sanitizing and validating the user input.
 *
 * @param {Object} req - The request object containing a JSON body with email and password provided by the user.
 * @param {Object} res - The response object.
 * @returns {Object} - Returns a JWT token with a lifespan of 15 minutes upon successful login. 
 * Stored in localStorage on the client side.
 */
authRouter.post('/login', loginValidationRules(), async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ message: "Error en la entrada de datos" });
    try {
        const { email, password } = req.body;
        const { idUser, userName, idRole, is_admin } = await getUser(email, password);
        const jwtConstructor = new SignJWT({ idUser, userName, idRole, is_admin })
        const enconder = new TextEncoder();
        const jwt = await jwtConstructor
            .setProtectedHeader({ alg: "HS256", typ: "JWT" })
            .setIssuedAt()
            .setExpirationTime("15 min")
            .sign(enconder.encode(configJWT.private_key));
        return res.status(200).json({ jwt })

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });

    }

});
/**
 * Route handler for updating user settings.
 * This endpoint is protected by middleware `validateTokenAndOwner_Post` which ensures that the request 
 * is made by an authenticated user who owns the profile they are trying to update. 
 * The actual update logic is abstracted to the `updateUser` function. 
 * If an error occurs during the update process (for example, a database error), 
 * it catches the error and responds with a 500 Internal Server Error status, 
 * providing the error details in the response body.
 * 
 * @param {Object} req - The HTTP request object, containing the user's updated settings in the body.
 * @param {Object} res - The HTTP response object used for sending back responses to the client.
 */
authRouter.post('/updateSettings', validateTokenAndOwner_Post, async (req, res) => {
    try {
        await updateUser(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

});

/**
 * Route handler for updating user permisions.
 * This endpoint is protected by middleware `validateTokenAndOwner_Post` which ensures that the request 
 * is made by an authenticated user who owns the profile they are trying to update. 
 * The actual update logic is abstracted to the `updateUser` function. 
 * If an error occurs during the update process (for example, a database error), 
 * it catches the error and responds with a 500 Internal Server Error status, 
 * providing the error details in the response body.
 * 
 * @param {Object} req - The HTTP request object, containing the user's updated settings in the body.
 * @param {Object} res - The HTTP response object used for sending back responses to the client.
 */
authRouter.post('/updatePermision', validateTokenAndOwner_Post, async (req, res) => {
    try {
        await updatePermisions(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });

    }
})
/**
 * Defines a route handler for the password change endpoint. It uses middleware to validate
 * the JWT token and checks if the requester is the owner of the account they intend to update.
 * The actual logic for changing the password is abstracted to the `changePassword` function.
 * If an error occurs during the password change process, such as a database error or an issue
 * within the `changePassword` function, this handler catches the error and responds with a
 * 500 Internal Server Error status, providing the error details in the response.
 * 
 * @param {*} req - The request object, expected to include user ID, current password, and new password in the body.
 * @param {*} res - The response object used for sending back responses to the client.
 */
authRouter.post('/changePassword', validateTokenAndOwner_Post, async (req, res) => {
    try {
        await changePassword(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})
/**
 * Endpoint to retrieve and view a user's profile based on their user ID. This GET request
 * requires a valid token and passes additional entry validation through `validateTokenAndEntry`
 * middleware to ensure the requester has the necessary permissions to access the profile information.
 * The user ID is expected to be provided as a path parameter. The function `viewProfile` is called
 * with the provided user ID to fetch the profile data. If the profile exists and is public, the profile
 * information is returned with a 200 OK status. If the profile is private or does not exist, an empty
 * array is returned, also with a 200 OK status, to indicate a successful request but with no content
 * to display. Any server-side errors encountered during the process are caught and returned as a 500
 * Internal Server Error with error details.
 *
 * @param {Object} req - The HTTP request object, containing the user ID as a path parameter.
 * @param {Object} res - The HTTP response object used for sending back the profile data or errors.
 */
authRouter.get('/viewProfile/:idUser', validateTokenAndEntry, async (req, res) => {
    try {
        const resp = await viewProfile(req.params.idUser);
        if (resp) {
            return res.status(200).json(resp);
        } else {
            return res.status(200).json([]);
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });

    }
})
/**
 * Handles the load smart meter endpoint, only register user with a JWT token can upload a new smart meter
 * @param {Object} req - The request object containing a JSON body with the name, addres and idOwner of the smart meter.
 * @param {Object} res - The response object.
 * @returns {*} Returns 200 if the smart meter was added else if not
 */
authRouter.post('/loadSmartMeter', validateTokenAndEntry, async (req, res) => {
    try {
        await addSmartMeter(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});
/**
 * Handles the remove smart meter endpoint. Only Registered user with a JWT token can remove a smart meter from their 
 * collection
 * @param {Object} req - The request object containing a JSON body with the id of the smart meter and the id of the owner.
 * @param {Object} res - The response object.
 */
authRouter.post('/removeSmartMeter', validateTokenAndOwner_Post, async (req, res) => {
    try {
        await removeSmartMeter(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });

    }
});

/**
 * Handles the get smart meter from user endpoint. Only registered user with JWT token can access to this section
 * @param {Object} req - The request object containing a JSON body with the id of the smart meter.
 * @param {Object} res - The response object.
 */
authRouter.get('/getSmartMeterUser/:idUser', validateTokenAndOwner_Get, async (req, res) => {
    try {
        const resp = await getSmartMetersFromUser(req.params.idUser);
        if (resp.length > 0) {
            return res.status(200).json(resp);
        } else {
            return res.status(404).json([]);
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });

    }
});
/**
 * Handles the get smart meter from user endpoint. Only registered user with JWT token can access to this section
 * @param {Object} req - The request object containing a JSON body with the id of the smart meter.
 * @param {Object} res - The response object.
 */
authRouter.get('/getSmartMeterAddress/:idUser', validateTokenAndEntry, async (req, res) => {
    try {
        const resp = await getAddressSmartMeter(req.params.idUser);
        if (resp.length > 0) {
            return res.status(200).json(resp);
        } else {
            return res.status(404).json([]);
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });

    }
});

/**
 * Handles the update smart meter endpoint. Only registered user with JWT token can access to this section
  * @param {Object} req - The request object containing a JSON body with the id of the smart meter.
  * @param {Object} res - The response object.
 */
authRouter.post('/updateSmartMeter', validateTokenAndOwner_Post, async (req, res) => {
    try {
        await updateSmartMeter(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})
/**
 * Handles the send personal notification endpoin. Only can be executed if an JWT is sended in the header
 * @param {Object} req- The request object, that contains the content, the ID of the destination user, and the ID of the sender,
 *  or null if it's the system itself. 
 * @param {Object} res- The response object used to send back a response to the client.
 */
authRouter.post('/sendNotificationToUser', validateTokenAndEntry, async (req, res) => {
    try {
        await InsertPersonalNotfication(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

/**
 * Handles the end point that allows to mark a notification as read
 * @param {Object} req- The request object that contains the id/s of the notification to be marked as read
 * @param {Object} res- The response object used to send the result back to the client
 */
authRouter.post("/markNotificationPersonalAsRead", validateTokenAndOwner_Post, async (req, res) => {
    try {
        await markNotificationPersonalAsReaded(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});
/**
 * Endpoint to retrieve all active chat notifications for a specific user. This route is protected,
 * requiring a valid JWT token for authentication and authorization, ensuring that the requesting user
 * is allowed to access the chat notifications for the specified user ID in the URL parameter (`idUser`).
 * @param {Object} req - The Express request object, containing the `idUser` parameter from the URL.
 * @param {Object} res - The Express response object used to send back the result.
 */
authRouter.get("/getActivechats/:idUser", validateTokenAndOwner_Get, async (req, res) => {
    try {
        const resp = await getActiveChats(req.params.idUser);
        if (resp) {
            return res.status(200).json(resp);
        } else {
            return res.status(200).json([]);
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

authRouter.get("/getFullChat/:idUser/:idUser2", validateTokenAndOwner_Get, async (req, res) => {
    try {
        const resp = await getFullChatWithUser(req.params.idUser, req.params.idUser2);
        if (resp) {
            return res.status(200).json(resp);
        } else {
            return res.status(200).json([]);
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});
/**
 * Endpoint to fetch all personal notifications sent by the system to a specific user. This route is also protected,
 * requiring a valid JWT token for authentication and authorization. The `validateTokenAndOwner_Get` middleware ensures
 * that the requesting user has the right to view the notifications for the specified user ID in the URL parameter (`idUser`).
 * 
 * The `getPersonalNotificationsfromSystem` function is called to retrieve notifications where the specified user is the receiver,
 * the notifications are from the system (indicated by a `null` sender ID), and have not been read.
 * 
 * @param {Object} req - The Express request object, containing the `idUser` parameter from the URL.
 * @param {Object} res - The Express response object used to send back the result.
 */
authRouter.get("/getSystemPersonalNotifications/:idUser", validateTokenAndOwner_Get, async (req, res) => {
    try {
        const resp = await getPersonalNotificationsfromSystem(req.params.idUser);
        if (resp) {
            return res.status(200).json(resp);
        } else {
            return res.status(200).json([]);
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})

/**
 * Handles the end point that allows to create a new broadcast notification
 * @param {Object} req- The request object, containing the necessary information to create a new broadcast notification
 * @param {Object} res- The response object used to send back the response to the client.This includes the status of the operation and any messages or IDs generated as a result of the operation
 */
authRouter.post("/sendBroadcastNotification", validateTokenAndEntry, async (req, res) => {
    try {
        await insertBroadcatNotification(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

/**
 * Handles the send of broadcast notification endpoin. Only can be executed if an JWT is sended in the header
 * @param {Object} req-  The request object, that contains the id of the notification and the list of all users reciving the notification
 * @param {Object} res- The response object used to sen back a response to the client
 */
authRouter.post('/sendBroadcastAllUsers', validateTokenAndEntry, async (req, res) => {
    try {
        await insertUserToBroadcastNotification(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});


/**
 * Handles the end point that allows a user to mark a broadcast notification as read
 * @param {Object} req - The request object that contains the id of the notification to be marked as read
 * @param {Object} res - The response object used to send the result back to the client
 */
authRouter.post("/markNotificationBroadcasrAsRead", validateTokenAndOwner_Post, async (req, res) => {
    try {
        await markNotificationBroadcastAsReaded(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});
/**
* Handles GET requests to retrieve all unread broadcast notifications for a specific user. The user ID is specified in the URL path as a parameter.
 * This endpoint requires the client to be authenticated and authorized to access the notifications for the user specified by `idUser`.
 * The `validateTokenAndOwner_Get` middleware is used to validate the JWT token provided by the client and to ensure that the authenticated
 * user is authorized to view the notifications of the specified user. If the authentication or authorization fails, the middleware
 * will send an appropriate error response and this handler will not be executed.
 * 
 * @param {Object} req - The request object from Express. It contains the route parameters, including `idUser`, which is used
 * to identify the user whose broadcast notifications are being retrieved.
 * @param {Object} res - The response object from Express. It is used to send back the JSON response to the client.
 */
authRouter.get('/getUserBroadcastNotifications/:idUser', validateTokenAndOwner_Get, async (req, res) => {
    try {
        const resp = await getBroadcastnotifications(req.params.idUser);
        if (resp) {
            return res.status(200).json(resp);
        } else {
            return res.status(200).json([]);
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})

/**
 * Handles the end point that allows to insert a new offer to the market. This end point will be called when a consumer
 * decides to reveal an offer and send it to the market
 * @param {Object} req - The request object that contains the price per kwh, the amount of energy and the id of the producer
 * @param {Object} res - The response object used to send the result back to the client
 */
authRouter.post("/insertMarketOffer", validateTokenAndOwner_Post, async (req, res) => {
    try {
        await InsertMarketOffer(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

/**
 * Handles the end point that allows updates the amount of energy in a market offer. When a consumer selects an offer, 
 * if there is leftover energy, this functions updates the amount of energy.
 * @param {Object} req - The request object with the id of the offer and the new amount of energy
 * @param {Object} res - The response object used to send the result back to the client
 */
authRouter.post("/updateMarketOffer", validateTokenAndEntry, async (req, res) => {
    try {
        if (req.body.systemAuth) {
            const { idOfert, signature, wallet } = req.body;
            const originalMessage = `Se va a proceder a la creación de un acuerdo, confirme que ha seleccionado la oferta ${idOfert}`
            const signingAddress = ethers.verifyMessage(originalMessage, signature)
            if (signingAddress.toLowerCase() !== wallet.toLowerCase()) res.status(401).json({ error: "Verification failed." });
        }
        await UpdateAmountMarketOffer(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})
/**
 * Handles the end point that allows updates the is_avaliable attribute of energy in a market offer. When a consumer selects an offer, 
 * if there is leftover energy, this functions updates the is_avaliable attribute.
 * @param {Object} req - The request object with the id of the offer and the new is_avaliable
 * @param {Object} res - The response object used to send the result back to the client
 */
authRouter.post("/updateAvaliableMarketOffer", validateTokenAndEntry, async (req, res) => {
    try {
        await UpdateAvaliableOffer(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})
/**
 * Handles the end point that allows to removes a market offer from the table. When a consumer buys all the energy from a supply,
 *  the system remove the record from the table. Furthermore, if the producer wishes to withdraw an existing offer from the 
 * market, he can call this function and destroy the record
 * @param {Object} req - The request object that contains the id of the offer
 * @param {Object} res - The response object used to send the result back to the client
 */

authRouter.post("/deleteMarketOffer", validateTokenAndOwner_Post, async (req, res) => {
    try {
        if (req.body.systemAuth) {
            const { idOfert, signature, wallet } = req.body;
            console.log("wallet", wallet)
            const originalMessage = `Se va a proceder a la creación de un acuerdo, confirme que ha seleccionado la oferta ${idOfert}`
            const signingAddress = ethers.verifyMessage(originalMessage, signature)
            console.log(signingAddress);
            if (signingAddress.toLowerCase() === wallet.toLowerCase()) {
                await deleteMarketOfferSystem(req, res)
            } else {
                return res.status(401).json({ error: "Verification failed." });
            }
        } else {
            await deleteMarketOffer(req, res);

        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})
/**
 * Route handler to fetch and return all available market offers. This endpoint is protected and requires
 * the client to be authenticated. The `validateTokenAndEntry` middleware is used to validate the JWT token
 * provided in the request headers and ensure the client is authorized to access this endpoint.
 * @param {Object} req - The request object from Express, not used directly in this handler.
 * @param {Object} res - The response object from Express, used by `getMarketOffer` to send the response.
 */
authRouter.get("/returnAllMarkerOffers", validateTokenAndEntry, async (req, res) => {
    try {
        await getMarketOffer(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});
/**
 * Route handler to retrieve all available offers made by a specific producer. The producer's ID is specified
 * in the URL path as `idUser`. This endpoint is also protected, utilizing the `validateTokenAndOwner_Get` middleware
 * to validate the JWT token and ensure the requesting client is authorized to view the offers from the specified
 * producer, potentially verifying the client is the producer themselves or has permission to view their offers.
 * @param {Object} req - The request object from Express. `req.params.idUser` is used to specify the producer ID.
 * @param {Object} res - The response object from Express. Used to send back the JSON response to the client.
 */
authRouter.get("/getOffersFromProducer/:idUser", validateTokenAndOwner_Get, async (req, res) => {
    try {
        const resp = await getOfferFromProducer(req.params.idUser);
        if (resp.length > 0) {
            return res.status(200).json(resp);
        } else {
            return res.status(200).json([])
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})

/**
 * Route handler to retrieve all no reveal offers made by a specific producer. The producer's ID is specified
 * in the URL path as `idUser`. This endpoint is also protected, utilizing the `validateTokenAndOwner_Get` middleware
 * to validate the JWT token and ensure the requesting client is authorized to view the offers from the specified
 * producer, potentially verifying the client is the producer themselves or has permission to view their offers.
 * @param {Object} req - The request object from Express. `req.params.idUser` is used to specify the producer ID.
 * @param {Object} res - The response object from Express. Used to send back the JSON response to the client.
 */
authRouter.get("/getNotRevealOffersFromProducer/:idUser", validateTokenAndOwner_Get, async (req, res) => {
    try {
        const resp = await getNotRevealOffersFromProducer(req.params.idUser);
        if (resp.length > 0) {
            return res.status(200).json(resp);
        } else {
            return res.status(200).json([])
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
})

/**
 * Handles the end point that creates a new agreement record in the database. When a consumer buys all the energy from a supply,
 *  the system remove the record from the table. Furthermore, if the producer wishes to withdraw an existing offer from the 
 * market, he can call this function and destroy the record
 * @param {Object} req - req - The request object containing the necessary data for creating a new agreement, 
 * including contractAddress, price_kwh, totalEnergy, idConsumer, and idProducer.
 * @param {Object} res - The response object used to send back a success message if the record is added successfully
 * or an error message if the operation fails.
 */
authRouter.post('/createAgreement', validateTokenAndEntry, async (req, res) => {
    try {
        await createAgreement(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

/**
 * Handles the end point that marks an existing agreement as finished (no longer alive) in the database.
 * @param {Object} req - The request object containing the contractAddress to identify the agreement to be finished.
 * @param {Object} res - The response object used to send back a success message if the agreement is updated successfully
 * or an error message if the operation fails or the agreement is not found.
 */
authRouter.post('/finishAgreement', validateTokenAndEntry, async (req, res) => {
    try {
        await finishAgreement(req, res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

/**
 * Handles the retrieval of all user agreements for a specific user. This endpoint requires a valid JWT token for authorization
 * and checks if the authenticated user is authorized to access the agreements of the user specified by the `idUser` parameter in the URL.
 * Only agreements where the authenticated user is either the consumer or the producer will be returned, and only if those agreements are active.
 * 
 * @param {Object} req - The request object. The `idUser` parameter in the URL specifies the user ID for whom the agreements are being retrieved.
 * @param {Object} res - The response object used to return the user agreements or an error message.
 */
authRouter.get('/getUserAgreements/:idUser', validateTokenAndOwner_Get, async (req, res) => {
    try {
        const resp = await getAllUserAgreements(req.params.idUser);
        if (resp) {
            return res.status(200).json(resp);
        } else {
            return res.status(404).json("Not found");
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

/**
 * Handles the retrieval of user agreements for a specific contractAddress. This endpoint requires a valid JWT token for authorization
 * and checks if the authenticated user is authorized to access the agreements of the user specified by the `idUser` parameter in the URL.
 * @param {Object} req - The request object. The `idUser` parameter in the URL specifies the user ID for whom the agreements are being retrieved.
 * @param {Object} res - The response object used to return the user agreements or an error message.
 */
authRouter.get('/getAgreementFromContract/:contractAddress/:idUser', validateTokenAndOwner_Get, async (req, res) => {
    try {
        const resp = await getAgreementFromContract(req.params.idUser, req.params.contractAddress);
        if (resp) {
            return res.status(200).json(resp);
        } else {
            return res.status(404).json("Not Found");
        }

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", details: error.message });

    }
})


export default authRouter