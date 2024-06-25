import { useEffect, useState } from "react";
import { useUser } from "../admin_start";
import axios from "axios";
import { useWeb3 } from "../web3Context";
import { ethers } from "ethers";
import { Link } from "react-router-dom";



const ManageOffers = ({ URI, functionSuccess, functionError }) => {
    const [offers, setOffers] = useState([]);
    const { user, token } = useUser();
    const { etradingMarketAddress, etradingMarketAbi, signer } = useWeb3();

    const loadOffers = async () => {
        try {
            const resp = await axios.get(URI + 'auth/getOffersFromProducer/' + parseInt(user.idUser, 10), {
                headers: { 'Authorization': token }
            })
            if (resp.status === 200) {
                console.log(resp.data);
                setOffers(resp.data);
            }
        } catch (error) {
            console.log("Error al cargar las ofertas", error);
        }
    }

    useEffect(() => {
        loadOffers();
    }, [])

    const RemoveFromDataBase = async (idOffer) => {
        try {
            const resp = await axios.post(URI + 'auth/deleteMarketOffer', {
                idUser: user.idUser,
                idOfert: idOffer
            }, {
                headers: { 'Authorization': token },
            })
            return resp.status === 200;
        } catch (error) {
            console.log("Error", error);
            return false;
        }
    }
    const RemoveFromBlockchain = async (idOffer) => {
        try {
            if (signer) {
                const contract = new ethers.Contract(etradingMarketAddress.address, etradingMarketAbi.abi, signer);
                const transaction = await contract.deleteOffer(idOffer);
                const res = await transaction.wait();
                return res.status === 1;
            } else {
                return false;
            }
        } catch (error) {
            console.log("Error capa blockchain", error);
            return false;

        }
    }
    const handleDeleteOffer = async (idOffer, price_kwh, amount_energy) => {

        try {
            if (await RemoveFromDataBase(idOffer)) {
                if (await RemoveFromBlockchain(idOffer)) {
                    loadOffers();
                    return functionSuccess("La oferta ha sido eliminada satisfactoriamente");

                } else {
                    // Neceistamos inserir la oferta de nuevo en la capa de datos
                    await axios.post(URI + 'auth/insertMarketOffer', {
                        idOfert: idOffer,
                        price_kwh: price_kwh,
                        amount_energy: amount_energy,
                        idProducer: user.idUser
                    })
                    return functionError("Comprueba la conexión a metamaks e intentalo de nuevo")
                }

            } else {
                return functionError("Ha ocurrdo un error y no se ha podido eliminar la oferta, intentalo mas tarde")
            }

        } catch (error) {
            console.log("Error", error)
            return functionError("Ha ocurrdo un error y no se ha podido eliminar la oferta, intentalo mas tarde")

        }
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
                        {offers.length > 0 ? (
                            offers.map((offer) => (
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

                                            <div className="d-grid gap-2">
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
export default ManageOffers;