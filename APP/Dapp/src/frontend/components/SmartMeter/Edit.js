import axios from "axios";
import { useEffect, useState } from "react";
import { useUser } from "../admin_start";
import { Link } from "react-router-dom";


const EditSmartMeter = ({ URI, functionSuccess, funcionError }) => {
    const [name, setName] = useState('');
    const [wallet, setWallet] = useState('');
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
    const updatrInfoSmartMeter = async (idSmartMeter) => {
        try {
            const resp = await axios.post(URI + 'auth/updateSmartMeter', {
                idSmartMeter: idSmartMeter,
                name: name,
                wallet: wallet,
                idUser: user.idUser
            }, {
                headers: { 'Authorization': token }
            });
            if (resp.status === 200) {
                loadSmartMeterUser();
                return functionSuccess("Información actualizada correectamente");
            } else {
                return funcionError("Ha ocurrido un error durante la actualización, intentalo mas tarde")
            }

        } catch (error) {
            console.log("Error en la actualización", error);
            return funcionError("Ha ocurrido un error durante la actualización, intentalo mas tarde")

        }
    }
    useEffect(() => {
        loadSmartMeterUser();
    }, []);

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
                            smartMeters.map((smartMeter) => (
                                <div className="col-lg-6 mb-4" key={smartMeter.idSmartMeter}>
                                    <div className="card h-100">
                                        <div className="card-body">
                                            <h5 className="card-title">Detalles del Lector Inteligente</h5>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                updatrInfoSmartMeter(smartMeter.idSmartMeter);
                                            }}>
                                                <div className="mb-3">
                                                    <label className="form-label">Nombre:</label>
                                                    <input type="text" className="form-control"
                                                        defaultValue={smartMeter.name}
                                                        onChange={(e) => setName(e.target.value)} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Dirección Wallet:</label>
                                                    <input type="text" className="form-control"
                                                        defaultValue={smartMeter.wallet}
                                                        onChange={(e) => setWallet(e.target.value)} />
                                                </div>
                                                <div className="d-grid gap-2">
                                                    <button type="submit" className="btn btn-primary">Actualizar</button>
                                                </div>
                                            </form>
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
export default EditSmartMeter;