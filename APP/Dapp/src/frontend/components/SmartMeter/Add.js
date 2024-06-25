import { useState } from 'react';
import { useUser } from '../admin_start';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AddSmartMeter = ({ URI, functionSuccess, funcionError }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const { user, token } = useUser();

    const AddSmartMeter = async (event) => {
        try {
            event.preventDefault();
            console.log("Nombre", name)
            const resp = await axios.post(URI + 'auth/loadSmartMeter', {
                name: name,
                wallet: address,
                idUser: user.idUser
            }, {
                headers: { 'Authorization': token }
            })
            if (resp.status === 200) return functionSuccess("Lector añadido correctamente");
            return funcionError("Ha ocurrido un error, intentalo mas tarde")

        } catch (error) {
            console.log("Error en la inserción de lectores inteligentes", error);
            return funcionError("Ha ocurrido un error, intentalo mas tarde")

        }
    }
    return (
        <>
            <main>

                <div className="pagetitle">
                    <h1>Añadir Lector inteligente</h1>
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
                                    <h5 className="card-title">Añade tu lector inteligente</h5>
                                    <form className="row g-3" onSubmit={AddSmartMeter}>
                                        <div className="col-12">
                                            <label htmlFor="inputPriceKwH" className="form-label">Nombre</label>
                                            <input type="text" className="form-control" id="inputPriceKwH"
                                                onChange={(e) => setName(e.target.value)} />
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="inputEnergyAmount" className="form-label">Wallet</label>
                                            <input type="text" className="form-control" id="inputEnergyAmount"
                                                onChange={(e) => setAddress(e.target.value)} />
                                        </div>
                                        <div className="d-grid gap-2">
                                            <button type="submit" className="btn btn-primary">Añadir</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

            </main>
        </>
    );

}
export default AddSmartMeter;