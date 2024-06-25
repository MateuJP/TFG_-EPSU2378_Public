import { ethers } from "ethers";
import { useWeb3 } from "../web3Context";
import axios from "axios";
import { useUser } from "../admin_start";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const OfferConsumerManager = ({ URI, functionError, functionSuccess }) => {

    const [offers, setOffers] = useState([]);
    const [energyRequest, setEnergyRequest] = useState(0);
    const [refreshOffers, setRefreshOffers] = useState(false); // Nuevo estado para forzar la recarga
    const { user, token, valitWallet } = useUser();
    const { etradingMarketAddress, etradingMarketAbi, account, signer } = useWeb3();

    const loadMarketOffers = async () => {
        try {
            const resp = await axios.get(URI + 'auth/returnAllMarkerOffers', {
                headers: { 'Authorization': token },
            })
            if (resp.status === 200) {
                setOffers(resp.data);
            } else {
                functionError("Error al cargar las ofertas, intentalo mas tarde")
            }
        } catch (error) {
            console.log("Error al cargar datos", error)
        }

    }
    const sendNotificationToUser = async (idUser, conent) => {
        try {
            const resp = await axios.post(URI + 'auth/sendNotificationToUser', {
                idUser: idUser,
                idSender: null,
                idReciver: idUser,
                content: conent,
                idType: 1
            }, {
                headers: { 'Authorization': token },

            })
            if (resp.status !== 200) {
                functionError("Ha ocurrdido un error durante la selección, vuelvalo a intentar mas tarde")
            }

        } catch (error) {
            console.log("Error al enviar mensaje", error)
            throw error

        }
    }
    const handleGetSmartMeter = async (idUser) => {
        try {
            const resp = await axios.get(URI + 'auth/getSmartMeterAddress/' + parseInt(idUser, 10), {
                headers: { 'Authorization': token }
            });
            if (resp.status === 200) {
                return resp.data;
            } else {
                return null;
            }

        } catch (error) {
            console.log("Error al cargar los datos de los lectores inteligentes", error);
            throw error
        }
    }

    const handlePostRequest = async (url, body, header) => {
        try {
            const resp = await axios.post(url, body, header);
            if (resp.status === 200) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log("Error en las solicitudes post", error)
            throw error;
        }
    }
    const handleAgrementModelRegister = async (agreementAddress, price_kwh, energyRequest, idConsumer, idProducer) => {
        try {
            const resp = await axios.post(URI + 'auth/createAgreement', {
                contractAddress: agreementAddress,
                price_kwh: price_kwh,
                totalEnergy: energyRequest,
                idConsumer: idConsumer,
                idProducer: idProducer
            }, {
                headers: { 'Authorization': token },
            });
            if (resp.status === 200) {
                return true;
            } else {
                return false;
            }

        } catch (error) {
            console.log("Error al crear el acuerdo en la capa de datos", error);
            throw error;
        }

    }
    const revertDeletion = async (idOffer, idUser, idProducer, amount_energy, price_kwh) => {
        try {

            await handlePostRequest(URI + 'auth/insertMarketOffer', {
                idOfert: idOffer,
                idUser: idUser,
                idProducer: idProducer,
                amount_energy: amount_energy,
                price_kwh: price_kwh,
                is_avaliable: 1
            }, {
                headers: { 'Authorization': token }
            })
        } catch (error) {
            console.log("Error al revertir la operación de eliminación")
            throw error
        }
    }

    const revertUpdate = async (idUser, idOffer, energyAmount) => {
        try {
            await handlePostRequest(URI + 'auth/updateMarketOffer', {
                idUser: idUser,
                idOfert: idOffer,
                amount_energy: energyAmount,
            }, {
                headers: { 'Authorization': token }
            })

        } catch (error) {
            console.log("Error al revertir la operación de inserción")
            throw error;
        }
    }
    const handleAgreementCreate = async (index) => {
        try {
            const offer = offers[index];
            const idOffer = offer.idOffer;
            const price_kwh = offer.price_kwh;
            const energyAmount = offer.amount_energy;
            const idProducer = offer.idProducer;

            let resp = await handleGetSmartMeter(user.idUser)
            const smartMeterConsumer = (resp.map(item => item.address));
            resp = await handleGetSmartMeter(idProducer);
            const smartMeterProducer = (resp.map(item => item.address));

            if (parseFloat(energyRequest) === parseFloat(energyAmount)) {
                // All energy has been consumed
                const signature = await signer.signMessage(`Se va a proceder a la creación de un acuerdo, confirme que ha seleccionado la oferta ${idOffer}`);
                resp = await handlePostRequest(URI + 'auth/deleteMarketOffer', {
                    idUser: user.idUser,
                    idOfert: idOffer,
                    systemAuth: true,
                    signature: signature,
                    wallet: account
                }, { headers: { 'Authorization': token } })
                if (!resp) return functionError("Error durante la cración del acuerod");
            } else {
                const signature = await signer.signMessage(`Se va a proceder a la creación de un acuerdo, confirme que ha seleccionado la oferta ${idOffer}`);
                resp = await handlePostRequest(URI + 'auth/updateMarketOffer', {
                    idUser: user.idUser,
                    idOfert: idOffer,
                    amount_energy: parseFloat(energyAmount - energyRequest),
                    systemAuth: true,
                    signature: signature,
                    wallet: account
                }, { headers: { 'Authorization': token } })
                if (!resp) return functionError("Error durante la cración del acuerod");
            }
            const agreementAddress = await handleBlockchainAgreement(idOffer, smartMeterConsumer, smartMeterProducer)
            if (agreementAddress) {
                try {
                    await sendNotificationToUser(idProducer, `Se ha creado un nuevo acuerdo, para la oferta ${idOffer}, por favor revise sus acuerdos activos para gestionar el acuerdo`);

                    await sendNotificationToUser(user.idUser, `El acuerdo se ha creado, puedes verlo en tu lista de acuerdos, el contrato es el siguiente : ${agreementAddress}`)

                    await handleAgrementModelRegister(agreementAddress, price_kwh, energyRequest, user.idUser, idProducer);

                } catch (error) {
                    if (energyAmount === energyRequest) {
                        await revertDeletion(idOffer, user.idUser, idProducer, energyAmount, price_kwh)
                    } else {
                        await revertUpdate(user.idUser, idOffer, energyAmount);
                    }
                    throw error;

                }

                functionSuccess("Acuerdo creado correctamente, puedes ir a verificarlo a tu lista de acuerdos")
                setRefreshOffers(prev => !prev);
            } else {

                // Revertir si ha fallado, para mantener la consistencia de datos
                if (energyAmount === energyRequest) {
                    await revertDeletion(idOffer, user.idUser, idProducer, energyAmount, price_kwh)
                } else {
                    await revertUpdate(user.idUser, idOffer, energyAmount);
                }
                functionError("Ha ocurrido un error, por favor inténtalo más tarde");
            }
        }
        catch (error) {
            console.error("Error detallado:", error);
            functionError("Ha ocurrido un error, por favor inténtalo más tarde");

        }
    }
    const handleBlockchainAgreement = async (idOffer, smartMeterConsumer, smartMeterProducer) => {
        try {
            const contract = new ethers.Contract(etradingMarketAddress.address, etradingMarketAbi.abi, signer);
            let _energy_amount_wei = ethers.utils.parseEther(energyRequest.toString()).toString();
            const transaction = await contract.createAgreement(idOffer, _energy_amount_wei, smartMeterConsumer, smartMeterProducer);
            const txReceipt = await transaction.wait();
            if (txReceipt.status !== 1) return false
            const event = txReceipt.events.find(e => e.event === "NewAgreement");
            if (event) {
                console.log(event.args);
                return event.args.agreement;
            }
            return null;
        } catch (error) {
            console.log("Error en la blockchain", error);
            return null

        }
    }
    const handleAmountChange = (event, offerIndex) => {
        let newAmount = parseFloat(event.target.value);
        const maxAmount = offers[offerIndex].amount_energy;

        if (newAmount > maxAmount) {
            newAmount = maxAmount;
            event.target.value = maxAmount;
        }
        if (newAmount < 0) {
            newAmount = 0;
            event.target.value = 0;
        }
        setEnergyRequest(event.target.value)
        setOffers(currentOffers =>
            currentOffers.map((offer, index) =>
                index === offerIndex ? { ...offer, selectedAmount: newAmount } : offer
            )
        );
    };


    const calculateTotal = (pricePerKwh, selectedAmount) => {
        return (pricePerKwh * selectedAmount).toFixed(2);
    };





    useEffect(() => {
        loadMarketOffers();
        return () => setRefreshOffers(false);
    }, [refreshOffers]);
    return (
        <>
            <main>
                <div className="pagetitle">
                    <h1>Cards</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/panelControl">Home</Link></li>
                        </ol>
                    </nav>
                </div>

                <section className="section">
                    <div className="row">
                        {offers.length > 0 ? (
                            offers.map((offer, index) => (
                                <div className="col-lg-6 mb-4" key={offer.idOffer}>
                                    <div className="card h-100">
                                        <div className="card-header">Oferta: {offer.idOffer}</div>
                                        <div className="card-body">
                                            <h5 className="card-title">Detalles de la oferta</h5>
                                            <p><strong>Precio KwH:</strong> <span style={{ color: '#007bff' }}>{offer.price_kwh} €</span></p>
                                            <p><strong>Cantidad de energía disponible:</strong> <span style={{ color: '#007bff' }}>{offer.amount_energy} KwH</span></p>
                                            <p><strong>Fecha de creación:</strong> <span style={{ color: '#007bff' }}>{offer.date_creation}</span></p>
                                            <div className="input-group mb-3">
                                                <input type="number" className="form-control" placeholder="Cantidad a comprar" aria-label="Cantidad a comprar"
                                                    onChange={(e) => handleAmountChange(e, index)}
                                                    max={offer.amount_energy} />
                                                <div className="input-group-append">
                                                    <span className="input-group-text">KwH</span>
                                                </div>
                                            </div>
                                            <p>Total: <span style={{ color: '#28a745' }}>{calculateTotal(offer.price_kwh, offer.selectedAmount || 0)} €</span></p>
                                        </div>
                                        <div className="card-footer">
                                            <div className="d-flex justify-content-center">
                                                <button type="button" className="btn btn-primary"
                                                    onClick={() => handleAgreementCreate(index)}>Confirmar compra</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <div className="alert alert-info" role="alert">
                                    <h4 className="alert-heading">No hay ofertas disponibles</h4>
                                    <p>Actualmente no hay ofertas disponibles. Espera a que el mercado se actualice para ver nuevas ofertas.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>


    )

}
export default OfferConsumerManager;