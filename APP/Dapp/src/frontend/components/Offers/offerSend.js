import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../admin_start";
import { ethers } from "ethers";
import { useWeb3 } from "../web3Context";
import { Link } from "react-router-dom";
const OfferSend = ({ URI, functionSuccess, functionError }) => {
    const [loading, setLoading] = useState(false);
    const [priceKwH, setPriceKwH] = useState(0);
    const [energyAmount, setEnergyAmount] = useState(0);
    const [marketStatus, setMarketStaus] = useState(0);
    const [minPrice, setMinPrice] = useState(0);
    const [ETradingMarketContract, setContractMarket] = useState(null);
    const { user, token, valitWallet } = useUser();
    const { etradingMarketAddress, etradingMarketAbi, account, web3Handler, signer } = useWeb3();

    const checkMarketStatus = () => {
        const now = new Date();
        const hours = now.getHours();


        const openHour = 8;
        // Real close hour
        //const closeHour = 22;
        const closeHour = 10;
        console.log(hours)
        if (hours >= openHour && hours < closeHour) {
            // El mercado esta abierto, por lo tanto no puedo mandar ofertas
            setMarketStaus(0);
        } else {
            // el mercado esta cerrado, si que puedo mandar ofertas
            setMarketStaus(1);
        }
    }
    useEffect(() => {
        const loadData = async () => {
            try {
                if (typeof window.ethereum !== 'undefined') {
                    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
                    const _contract = new ethers.Contract(etradingMarketAddress.address, etradingMarketAbi.abi, provider)
                    let price = await _contract.min_kwh_price();
                    setMinPrice(ethers.utils.formatEther(price));

                } else {
                    web3Handler()
                }
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            }
        };
        checkMarketStatus();
        loadData()
        const intervalId = setInterval(checkMarketStatus, 6000);
        return () => clearInterval(intervalId);

    }, [])




    const handleSubmitOffer = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const base = (Math.random() * (priceKwH + energyAmount)) * 100000000;
            const idOfert = Math.floor((Math.random() * base));
            const resp = await axios.post(URI + 'auth/insertMarketOffer', {
                idOfert: idOfert,
                price_kwh: priceKwH,
                amount_energy: energyAmount,
                is_avaliable: 0,
                idUser: user.idUser,
            }, {
                headers: { 'Authorization': token },
            });
            if (resp.status === 200) {
                if (await insertBlockchain(idOfert)) {
                    functionSuccess("Oferta enviada satisfactoriamente, espera a la apertura del mercado para poder revelarla")

                } else {
                    // Eliminamos el registro para mantener consistencia entre la capa de datos y el sistema
                    await axios.post(URI + 'auth/deleteMarketOffer', {
                        idOfert: idOfert,
                        idUser: user.idUser
                    }, {
                        headers: { 'Authorization': token },

                    });
                    functionError("Ha ocurrido un error, vuelve a intentarlo")
                }

            } else {
                functionError("Ha ocurrido un error, vuelve a intentarlo")
            }


        } catch (error) {
            functionError("Ha ocurrido un error, vuelve a intentarlo")
            console.log("Error al enviar la oferta", error)

        } finally {
            setLoading(false);
        }
    }

    const insertBlockchain = async (idOfert) => {
        try {
            // const provider = new ethers.providers.Web3Provider(window.ethereum);
            //const signer = provider.getSigner();
            const contract = new ethers.Contract(etradingMarketAddress.address, etradingMarketAbi.abi, signer);
            let _price_kwH_wei = ethers.utils.parseEther(priceKwH.toString()).toString();
            let _energy_amount_wei = ethers.utils.parseEther(energyAmount.toString()).toString();
            const transaction = await contract.submitOffer(_price_kwH_wei, idOfert, _energy_amount_wei);
            const receipt = await transaction.wait();
            return receipt.status === 1;
        } catch (error) {
            console.error("Error al enviar la oferta", error);
            return false

        };
    }

    return (
        <>
            <main>

                <div className="pagetitle">
                    <h1>Publicar Oferta</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/panelControl">Home</Link></li>
                        </ol>
                    </nav>
                </div>
                <section className="section">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Envía Tu Oferta de Mercado</h5>
                                    <form className="row g-3" onSubmit={handleSubmitOffer}>
                                        <div className="col-12">
                                            <label htmlFor="inputPriceKwH" className="form-label">Price KwH</label>
                                            <input type="text" className="form-control" id="inputPriceKwH"
                                                onChange={(e) => setPriceKwH(e.target.value)} />
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="inputEnergyAmount" className="form-label">Energy Amount</label>
                                            <input type="text" className="form-control" id="inputEnergyAmount"
                                                onChange={(e) => setEnergyAmount(e.target.value)} />
                                        </div>
                                        <div className="text-center">
                                            <button disabled={marketStatus === 0} type="submit" className="btn btn-primary">Submit</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="card">
                                <div className="card-body">
                                    <p className="card-title">Información del Mercado</p>
                                    <p>Puedes mandar ofertas, antes de que el mercado se abra,una vez abierto vas a poder hacerla pública</p>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontWeight: 'bold', color: '#343a40', display: 'inline' }}>
                                            Horario disponible para mandar ofertas:
                                        </p>
                                        <span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: '#007bff' }}>17:00 PM - 8:00 AM</span>
                                        {/*<span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: '#007bff' }}>22:00 PM - 8:00 AM</span>*/}
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontWeight: 'bold', color: '#343a40', display: 'inline' }}>Estado: {marketStatus === 1 ?
                                            <span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: 'green' }} className="market-status">Abierto para recibir ofertas</span>
                                            : <span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: 'red' }} className="market-status">Cerrado para recibir ofertas</span>
                                        }
                                        </p>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontWeight: 'bold', color: '#343a40', display: 'inline' }}>Precio Mínimo por KhW:
                                            <span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: '#007bff' }} className="market-status">{minPrice}€</span>

                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </>
    );
}

export default OfferSend;
