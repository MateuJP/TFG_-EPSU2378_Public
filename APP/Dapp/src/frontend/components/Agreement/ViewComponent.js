
import axios from "axios";
import { useUser } from "../admin_start";
import { useEffect, useState } from "react";
import { useWeb3 } from "../web3Context";
import { ethers } from "ethers";
import { Link, useParams } from "react-router-dom";
import SendMoney from "./sendMoney";
import { FaUserCircle, FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";
import IncidentManagment from "./Incident";

const AgreementViewComponent = ({ URI, functionSuccess, functionError, parseWei, parseEther }) => {
    const [agreement, setAgreement] = useState('');
    const [price, setPrice] = useState(0);
    const [balanceContract, setBalanceContract] = useState(0);
    const [energyProvided, setEnergyProvided] = useState(0);
    const [energyRecieved, setEnergyRecieved] = useState(0);
    const [hasStarted, setStartAgreement] = useState(false);
    const [incidentActive, setIncident] = useState(false);
    const [consumerConfirmed, setConsumerConfirmed] = useState(false);
    const [producerConfirmed, setProducerConfirmed] = useState(false);
    const { contractAddress } = useParams();
    const { user, token } = useUser();
    const { modelAgreementAbi, signer } = useWeb3();

    const loadAgreementFromDB = async () => {
        try {
            const resp = await axios.get(URI + 'auth/getAgreementFromContract/' + contractAddress + '/' + parseInt(user.idUser, 10), {
                headers: { 'Authorization': token }
            });
            if (resp.status === 200) {
                setAgreement(resp.data);
                setPrice((resp.data.price_kwh) * (resp.data.totalEnergy))
                console.log("Salgo")
            }
        } catch (error) {
            console.log("Error", error)
        }
    }

    const loadBalanceBlockchain = async () => {
        try {
            const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
            const contract = new ethers.Contract(contractAddress, modelAgreementAbi.abi, provider)
            console.log(contract)
            const balance = await contract.balanceSmartContract();
            const _start = await contract.consumerHasPaid();
            setStartAgreement(_start);
            const _energyProvided = await contract.energyProvided();
            setEnergyProvided(parseEther(_energyProvided));
            const _energyRecieved = await contract.energyReceived();
            setEnergyRecieved(parseEther(_energyRecieved));
            const _incident = await contract.incidentActive()
            setIncident(_incident);
            const _consumer_confirm = await contract.consumerConfirmed()
            setConsumerConfirmed(_consumer_confirm);
            const _producer_condirm = await contract.producerConfirmed()
            setProducerConfirmed(_producer_condirm);
            setBalanceContract(parseEther(balance));

        } catch (error) {
            console.log("Error al cargar datos del contrato", error)

        }
    }

    useEffect(() => {
        loadAgreementFromDB();
        loadBalanceBlockchain();
    }, [])
    return (
        <>
            <div className="pagetitle">
                <h1>Profile</h1>
                <nav>
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/PanelControl">Home</Link></li>
                    </ol>
                </nav>
            </div>

            <section className="section profile">
                <div className="row">
                    <div className="col-xl-4">

                        <div className="card">
                            <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">

                                <i style={{ fontSize: '50px' }} className="bi bi-person"><FaUserCircle /></i>
                                <h2>{user.userName}</h2>
                                <h3>{user.ROLE.name}</h3>
                                <div className="social-links mt-2">
                                    <a href="#" className="twitter"><FaTwitter /></a>
                                    <a href="#" className="facebook"><FaFacebook /></a>
                                    <a href="#" className="instagram"><FaInstagram /></a>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="col-xl-8">

                        <div className="card">
                            <div className="card-body pt-3">
                                <ul className="nav nav-tabs nav-tabs-bordered">

                                    <li className="nav-item">
                                        <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#agreement-overview">Overview</button>
                                    </li>

                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#balance-add">Gestionar Fondos</button>
                                    </li>

                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-settings">Gestionar Incidencias</button>
                                    </li>

                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-change-password">Entrada Manual</button>
                                    </li>

                                </ul>
                                <div className="tab-content pt-2">

                                    <div className="tab-pane fade show active profile-overview" id="agreement-overview">
                                        <h5 className="card-title">Detalles del contrato</h5>

                                        <div className="row">
                                            <div className="col-lg-3 col-md-4 label ">Precio KwH</div>
                                            <div className="col-lg-9 col-md-8">{agreement.price_kwh} GTT</div>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-3 col-md-4 label">Energia Acordada</div>
                                            <div className="col-lg-9 col-md-8">{agreement.totalEnergy} kwh</div>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-3 col-md-4 label">Precio Total</div>
                                            <div className="col-lg-9 col-md-8">{price} GTT</div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-3 col-md-4 label">Consumidor</div>
                                            <div className="col-lg-9 col-md-8">{agreement.consumerName}</div>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-3 col-md-4 label">Productor</div>
                                            <div className="col-lg-9 col-md-8">{agreement.producerName}</div>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-3 col-md-4 label">Balance Contrato</div>
                                            <div className="col-lg-9 col-md-8">{balanceContract} GTT</div>
                                        </div>
                                        <div className="row">
                                            <div className="col-lg-3 col-md-4 label">Incidencia Activa</div>
                                            <div className="col-lg-9 col-md-8">{incidentActive.toString()}</div>
                                        </div>
                                        {incidentActive ? (
                                            <>
                                                <div className="row">
                                                    <div className="col-lg-3 col-md-4 label">Incidente resuelto por consumidor</div>
                                                    <div className="col-lg-9 col-md-8">{consumerConfirmed.toString()}</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-lg-3 col-md-4 label">Incidente resuelto por produtor</div>
                                                    <div className="col-lg-9 col-md-8">{producerConfirmed.toString()}</div>
                                                </div>

                                            </>
                                        ) : (
                                            <>
                                                <div className="row">
                                                    <div className="col-lg-3 col-md-4 label">Energía Enviada</div>
                                                    <div className="col-lg-9 col-md-8">{energyProvided} kwh</div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-lg-3 col-md-4 label">Energía Recibida</div>
                                                    <div className="col-lg-9 col-md-8">{energyRecieved} kwh</div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="tab-pane fade profile-edit pt-3" id="balance-add">
                                        <SendMoney
                                            functionError={functionError}
                                            functionSuccess={functionSuccess}
                                            contractAddress={contractAddress}
                                            parseWei={parseWei}
                                            parseEther={parseEther}
                                            totalPay={price}
                                        />
                                    </div>

                                    <div className="tab-pane fade pt-3" id="profile-settings">
                                        <IncidentManagment
                                            functionError={functionError}
                                            functionSuccess={functionSuccess}
                                            contractAddress={contractAddress}
                                            modelAgreementAbi={modelAgreementAbi}
                                            parseWei={parseWei}
                                            URI={URI}
                                        />
                                    </div>

                                    <div className="tab-pane fade pt-3" id="profile-change-password">
                                    </div>

                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>

        </>

    )


}
export default AgreementViewComponent;