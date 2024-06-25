import { useState } from 'react';
import img from '../../../assets/login.webp'
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { useNavigate } from 'react-router';
import axios from 'axios'


const Login = ({ URI, functionSuccess, funcionError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const resp = await axios.post(URI + 'auth/login', {
                email: email,
                password: password
            })
            console.log(resp)
            if (resp.status === 200) {
                const token = resp.data.jwt;
                localStorage.setItem("token", token);
                window.location = '/panelControl'
            } else {
                funcionError('Usuario o contraseña incorrectos')

            }
        } catch (error) {
            funcionError('Usuario o contraseña incorrectos')

        }
    }
    return (
        <section className="vh-100 section-start">
            <div className="container h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-lg-12 col-xl-11">
                        <div className="card text-black" style={{ borderRadius: "25px" }}>
                            <div className="card-body p-md-5">
                                <div className="row justify-content-center">
                                    <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">

                                        <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Iniciar Sesión</p>

                                        <form className="mx-1 mx-md-4">

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <MdEmail className="fas fa-envelope fa-lg me-3 fa-fw" />
                                                <div className="form-floating flex-fill mb-0">
                                                    <input type="email" id="floatingEmail" className="form-control" placeholder='Your email' onChange={(e) => setEmail(e.target.value)} />
                                                    <label htmlFor="floatingEmail">Tu Email</label>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <RiLockPasswordFill className="fas fa-lock fa-lg me-3 fa-fw" />
                                                <div className="form-floating flex-fill mb-0">
                                                    <input type="password" id="floatingPassword" className="form-control" placeholder='Your Password' onChange={(e) => setPassword(e.target.value)} />
                                                    <label htmlFor="floatingPassword">Contraseña</label>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column justify-content-center mx-4 mb-3 mb-lg-4">
                                                <div className="text-center mb-3">
                                                    <button type="button" onClick={handleLogin} className="btn btn-primary btn-lg">Login</button>
                                                </div>
                                                <p className="text-center small fw-bold mb-0">
                                                    ¿No tienes cuenta? <a href="/register" className="link-primary">Crear Cuenta</a>
                                                </p>
                                            </div>



                                        </form>

                                    </div>
                                    <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">

                                        <img src={img}
                                            className="img-fluid" alt="Sample image" />

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default Login