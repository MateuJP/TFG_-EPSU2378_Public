import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../web3Context";
import { useUser } from "../admin_start";

import axios from "axios";

const IncidentManagment = ({ functionSuccess, functionError, contractAddress, parseWei, modelAgreementAbi, URI }) => {
    const { signer } = useWeb3();
    const [hasIncident, setHasIncident] = useState(false);
    const [energyAmount, setEnergyAmount] = useState(0);
    const { user, token } = useUser();

    const loadInfoBlockchain = async () => {
        try {
            console.log(user)
            console.log(token)
            const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
            const contract = new ethers.Contract(contractAddress, modelAgreementAbi.abi, provider)
            const _incident = await contract.incidentActive()
            setHasIncident(_incident);


        } catch (error) {
            console.log("Error al cargar datos del contrato", error)

        }
    };

    const handleActivateIncident = async (e) => {
        try {
            e.preventDefault();
            const contract = new ethers.Contract(contractAddress, modelAgreementAbi.abi, signer);
            const transaction = await contract.reportIncident();
            const tx = await transaction.wait();
            if (tx.status === 1) {
                handleNotification(`Se ha activado un incidente para el contrato ${contractAddress},accede a tu panel y resuelvelo`)
                return functionSuccess(`El incidente ha sido activado, satisfactoriamente, puede proceder a resolverlo`);
            } else {
                return functionError("Ha ocurrido un error duarante la activación de la incidencia, revisa tu conexión a metamask y el estado del acuerdo")
            }

        } catch (error) {
            console.log("Error", error)
            return functionError("Ha ocurrido un error duarante la activación de la incidencia, revisa tu conexión a metamask y el estado del acuerdo")

        }
    }
    const handleReportEnergy = async (e) => {
        try {
            e.preventDefault();
            const contract = new ethers.Contract(contractAddress, modelAgreementAbi.abi, signer);
            contract.on("ExchangeFinalized", async (consumer, producer, energyProvided, paymentAfterFee, refund, event) => {
                console.log("El intercambio ya ha finalizado");
                try {
                    const response = await axios.post("http://localhost:8000/smartFinishAgreement", {
                        contractAddress: contractAddress
                    });
                    console.log("Respuesta del servidor", response.data);
                } catch (error) {
                    console.error('Error al enviar la petición HTTP:', error);

                }
            })
            const transaction = await contract.resolveIncident(parseWei(energyAmount));
            const tx = await transaction.wait();
            if (tx.status === 1) {

                return functionSuccess(`El incidente ha sido activado, satisfactoriamente, puede proceder a resolverlo`);
            } else {
                return functionError("Ha ocurrido un error duarante la activación de la incidencia, revisa tu conexión a metamask y el estado del acuerdo")
            }

        } catch (error) {
            console.log("Error", error)
            return functionError("Ha ocurrido un error duarante la activación de la incidencia, revisa tu conexión a metamask y el estado del acuerdo")

        }
    }

    const handleNotification = async (message) => {
        try {
            const resp = await axios.get(URI + 'auth/getAgreementFromContract/' + contractAddress + '/' + parseInt(user.idUser, 10), {
                headers: { 'Authorization': token }
            });
            console.log("Activo incidencia", resp.data);
            sendNotificationToUser(resp.data.idConsumer, message);
            sendNotificationToUser(resp.data.idProducer, message);

        } catch (error) {
            console.log("Error", error)
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
    useEffect(() => {
        loadInfoBlockchain();
    }, [])
    return (
        <>
            <main className="container">
                <section className="section row">
                    <div className="col-md-6">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title text-center mb-4">Estado de la Incidencia</h5>
                                {hasIncident ? (
                                    <p className="text-center">Incidencia Activa</p>
                                ) : (
                                    <div className="d-grid gap-2">
                                        <p className="text-center" style={{ color: "red" }}>No hay incidencia Activa</p>

                                        <button
                                            className="btn btn-primary btn-lg"
                                            onClick={handleActivateIncident}>
                                            Activar Incidencia
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Segunda mitad */}
                    <div className="col-md-6">
                        <div className="card mb-4 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title text-center mb-4">Notificar Energía Manualmente</h5>
                                <form>
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ingresar energía manualmente"
                                            disabled={!hasIncident}

                                            onChange={(e) => setEnergyAmount(e.target.value)}
                                        />
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button type="button" className="btn btn-primary btn-lg" disabled={!hasIncident}
                                            onClick={handleReportEnergy}>Enviar Energía</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default IncidentManagment;
