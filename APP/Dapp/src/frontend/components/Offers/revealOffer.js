import axios from 'axios';
import { useEffect, useState } from 'react'
import { useUser } from '../admin_start';
import { ethers } from 'ethers';
import { useWeb3 } from '../web3Context';
import { Link } from 'react-router-dom';
const RevealOffer = ({ URI, functionSuccess, functionError }) => {
    const [loading, setLoading] = useState(false);
    const [isOpened, seMarketOpen] = useState(false);
    const [notRevealOffers, setOffers] = useState([]);
    const { user, token, valitWallet } = useUser();
    const [refreshOffers, setRefreshOffers] = useState(false); // Nuevo estado para forzar la recarga
    const { etradingMarketAddress, etradingMarketAbi, account, web3Handler, signer } = useWeb3();

    const loadMarketOfferNotReveal = async () => {
        try {
            const resp = await axios.get(`${URI}auth/getNotRevealOffersFromProducer/${parseInt(user.idUser, 10)}`, {
                headers: { 'Authorization': token },
            });
            if (resp.status === 200) {
                setOffers(resp.data);
            } else {
                console.error('Error durante la carga de ofertas');
            }
        } catch (error) {
            console.error('Error durante la carga de ofertas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRevealOffer = async (idOffer, price_kwh, energyAmount) => {
        setLoading(true);
        try {
            const resp = await updateOfferAvailability(idOffer, 1);
            if (resp.status === 200 && resp.data) {
                if (await updateBlockchain(idOffer, price_kwh, energyAmount)) {
                    functionSuccess("Oferta Publicada Satisfactoriamente");
                    setRefreshOffers(prev => !prev); // Cambia el estado para recargar las ofertas
                } else {
                    await updateOfferAvailability(idOffer, 0);
                    functionError("Ha ocurrido un error en la actualización de la blockchain. Por favor, inténtalo más tarde.");
                }
            } else {
                functionError("No se ha podido publicar, vuelve a intentarlo más tarde.");
            }
        } catch (error) {
            functionError("No se ha podido publicar, vuelve a intentarlo más tarde.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOffer = async (idOffer, price_kwh, energyAmount) => {
        setLoading(true);
        try {
            let resp = await updateBlockchain(idOffer, price_kwh, energyAmount);
            if (resp) {
                resp = await removeFromBlockchain(idOffer);
                if (resp) {
                    await axios.post(URI + 'auth/deleteMarketOffer', {
                        idUser: user.idUser,
                        idOfert: idOffer
                    }, {
                        headers: { 'Authorization': token },

                    })
                    functionSuccess("Registro eliminado satisfactoriamente")
                    setRefreshOffers(prev => !prev);

                } else {
                    functionError("Ha ocurrdo un error durante la eliminación, vuelve a intentarlo mas tarde");
                }

            } else {
                functionError("Ha ocurrdo un error durante la eliminación, vuelve a intentarlo mas tarde");

            }
        } catch (error) {
            functionError("Ha ocurrdo un error durante la eliminación, vuelve a intentarlo mas tarde");

            console.log(error)

        } finally {
            setLoading(false);
        }
    }

    const updateOfferAvailability = async (idOffer, is_avaliable) => {
        try {
            const resp = await axios.post(`${URI}auth/updateAvaliableMarketOffer`, {
                idUser: user.idUser,
                idOfert: idOffer,
                is_avaliable: is_avaliable
            }, {
                headers: { 'Authorization': token },
            });
            return resp;
        } catch (revertError) {
            console.error("Error al revertir la disponibilidad de la oferta:", revertError);
            return null;
        }
    };

    const updateBlockchain = async (idOffer, price_kwh, energyAmount) => {
        try {
            const contract = new ethers.Contract(etradingMarketAddress.address, etradingMarketAbi.abi, signer);
            let _price_kwH_wei = ethers.utils.parseEther(price_kwh.toString()).toString();
            let _energy_amount_wei = ethers.utils.parseEther(energyAmount.toString()).toString();
            const transaction = await contract.revealOffer(idOffer, _price_kwH_wei, _energy_amount_wei);
            const receipt = await transaction.wait();
            return receipt.status === 1;
        } catch (error) {
            console.error("Error en la capa de blockchain:", error);
            return false;
        }
    };
    const removeFromBlockchain = async (idOffer) => {
        try {
            const contract = new ethers.Contract(etradingMarketAddress.address, etradingMarketAbi.abi, signer);
            const transaction = await contract.deleteOffer(idOffer);
            const receipt = await transaction.wait();
            return receipt.status === 1;
        } catch (error) {
            console.error("Error en la capa de blockchain:", error);
            return false;
        }
    };

    useEffect(() => {
        loadMarketOfferNotReveal();
        return () => setRefreshOffers(false);
    }, [refreshOffers]);


    if (loading) {
        return (
            <h1>Cargando...</h1>
        )
    }
    return (
        <>
            <main>
                <div class="pagetitle">
                    <h1>Cards</h1>
                    <nav>
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><Link to="/panelControl">Home</Link></li>
                        </ol>
                    </nav>
                </div>


                <section className="section">
                    <div className="row">
                        {notRevealOffers.length > 0 ? (
                            notRevealOffers.map((offer) => (
                                <div className="col-lg-6 mb-4" key={offer.idOffer}>
                                    <div className="card h-100">
                                        <div className="card-header">Oferta: {offer.idOffer}</div>
                                        <div className="card-body">
                                            <h5 className="card-title">Detalles de la oferta</h5>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <p style={{ fontWeight: 'bold', color: '#343a40', display: 'inline' }}>Precio KwH:
                                                    <span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: '#007bff' }}>{offer.price_kwh} €</span>
                                                </p>
                                            </div>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <p style={{ fontWeight: 'bold', color: '#343a40', display: 'inline' }}>Cantidad de energía:
                                                    <span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: '#007bff' }}>{offer.amount_energy} KwH</span>
                                                </p>
                                            </div>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <p style={{ fontWeight: 'bold', color: '#343a40', display: 'inline' }}>Fecha de creación:
                                                    <span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: '#007bff' }}>{offer.date_creation}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <div className="buttons d-flex justify-content-center" style={{ gap: '30px' }}>
                                                <button type="button" className="btn btn-success"
                                                    onClick={() => handleRevealOffer(offer.idOffer, offer.price_kwh, offer.amount_energy)}>Publicar</button>
                                                <button type="button" className="btn btn-danger"
                                                    onClick={() => handleDeleteOffer(offer.idOffer, offer.price_kwh, offer.amount_energy)}>Eliminar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <div className="alert alert-info" role="alert">
                                    <h4 className="alert-heading">No hay ofertas disponibles</h4>
                                    <p>Actualmente no tienes ofertas disponibles, espera a que el mercado vuelva a cerrarse y publica tu oferta en el apartado "Hacer oferta"</p>
                                </div>
                            </div>

                        )}

                    </div>
                </section>

            </main>
        </>
    )

}
export default RevealOffer;