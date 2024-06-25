import { useEffect, useState } from "react";
import { useUser } from "../admin_start";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";



const AllAgreements = ({ URI }) => {
    const [agreements, setAgreement] = useState([]);
    const { user, token } = useUser();
    const navigate = useNavigate();

    const loadAgreements = async () => {
        try {
            const resp = await axios.get(URI + 'auth/getUserAgreements/' + parseInt(user.idUser, 10), {
                headers: { 'Authorization': token }
            });
            console.log(resp.data);
            if (resp.status === 200) setAgreement(resp.data);
        } catch (error) {
            console.log("Error en la carg de datos", error);
        }
    }
    useEffect(() => {
        loadAgreements();
    }, []);

    const handleSelectOffer = async (contractAddress) => {
        navigate(`/agreement/details/${contractAddress}`)

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
                        {agreements.length > 0 ? (
                            agreements.map((agreement) => (
                                <div className="col-lg-6 mb-4" key={agreement.contractAddress}>
                                    <div className="card h-100">
                                        <div className="card-header">Contrato: {agreement.contractAddress}</div>
                                        <div className="card-body">
                                            <h5 className="card-title">Detalles de la oferta</h5>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <p style={{ fontWeight: 'bold', color: '#343a40', display: 'inline' }}>Precio KwH:
                                                    <span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: '#007bff' }}>{agreement.price_kwh} GTT</span>
                                                </p>
                                            </div>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <p style={{ fontWeight: 'bold', color: '#343a40', display: 'inline' }}>Cantidad de energía:
                                                    <span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: '#007bff' }}>{agreement.totalEnergy} KwH</span>
                                                </p>
                                            </div>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <p style={{ fontWeight: 'bold', color: '#343a40', display: 'inline' }}>Activo:
                                                    <span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: '#007bff' }}>
                                                        {agreement.is_alive === 1 ? 'true' : 'false'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="card-footer">

                                            <div className="d-grid gap-2">
                                                <button type="button" className="btn btn-primary"
                                                    onClick={() => handleSelectOffer(agreement.contractAddress)}>Gestionar</button>
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
export default AllAgreements;