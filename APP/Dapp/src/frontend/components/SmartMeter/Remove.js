import { useEffect, useState } from 'react';
import { useUser } from '../admin_start';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RemoveSmartMeter = ({ URI, functionSuccess, functionError }) => {
    const [smartMeters, setSmartMeters] = useState([]);
    const { user, token } = useUser();

    const loadSmartMeterUser = async () => {
        try {
            const resp = await axios.get(URI + 'auth/getSmartMeterUser/' + parseInt(user.idUser, 10), {
                headers: { 'Authorization': token }
            })
            if (resp.status === 200) {
                console.log(resp.data)
                return setSmartMeters(resp.data);
            } else {
                return setSmartMeters([]);
            }
        } catch (error) {
            console.log("Error durante la carga de lectores inteligentes", error);

        }
    }
    useEffect(() => {
        loadSmartMeterUser();
    }, [])
    const removeSmartMeter = async (idSmartMeter) => {
        try {
            const resp = await axios.post(URI + 'auth/removeSmartMeter', {
                idSmartMeter: idSmartMeter,
                idUser: user.idUser
            }, {
                headers: { 'Authorization': token }
            })
            if (resp.status === 200) {
                loadSmartMeterUser();
                return functionSuccess("Lector eliminado correctamente");
            }
            return functionError("Ha ocurrido un error, intentalo mas tarde")

        } catch (error) {
            console.log("Error durante la eliminación de lectores inteligentes", error);
            return functionError("Ha ocurrido un error, intentalo mas tarde")

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
                        {smartMeters.length > 0 ? (
                            smartMeters.map((smatMeter) => (
                                <div className="col-lg-6 mb-4" key={smatMeter.idSmartMeter}>
                                    <div className="card h-100">
                                        <div className="card-header">Smart Meter: {smatMeter.idSmartMeter}</div>
                                        <div className="card-body">
                                            <h5 className="card-title">Detalles del Lector Inteligente</h5>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <p style={{ fontWeight: 'bold', color: '#343a40', display: 'inline' }}>Nombre:
                                                    <span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: '#007bff' }}>{smatMeter.name}</span>
                                                </p>
                                            </div>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <p style={{ fontWeight: 'bold', color: '#343a40', display: 'inline' }}>Dirección:
                                                    <span style={{ marginLeft: '0.5rem', fontWeight: 'normal', color: '#007bff' }}>{smatMeter.wallet} KwH</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <div className="d-grid gap-2">
                                                <button type="button" className="btn btn-danger"
                                                    onClick={() => removeSmartMeter(smatMeter.idSmartMeter)}>Eliminar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <div className="alert alert-info" role="alert">
                                    <h4 className="alert-heading">No tienes lectores inteligentes registrados</h4>
                                    <p>Actualmente no tienes lectores inteligentes disponibles,si quieres añadir uno, dirigete a la pestaña "Añadir" dentro de la sección de lectores inteligentes</p>
                                </div>
                            </div>

                        )}

                    </div>
                </section>

            </main>
        </>
    )

}
export default RemoveSmartMeter;