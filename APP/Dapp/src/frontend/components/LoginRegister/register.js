import { useEffect, useState } from 'react';
import img from '../../../assets/register.webp'
import { FaUser } from "react-icons/fa";
import { MdEmail, MdVerifiedUser } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaWallet } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios'
import { useWeb3 } from '../web3Context';


const Register = ({ URI, functionSuccess, functionError }) => {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [userName, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [wallet, setWallet] = useState('');
    const [roles, setRoles] = useState([])
    const { web3Handler, account, systemManagementAddress, systemManagementAbi } = useWeb3();


    useEffect(() => {
        if (account) {
            setWallet(account);
        }
    }, [account])

    const loadRoles = async () => {
        try {
            const resp = await axios.get(URI + 'getRoles');
            setRoles(resp.data)
            console.log(resp.data)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        setLoading(true);
        loadRoles();
        setLoading(false)
    }, [])

    const HandleCreateUser = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const resp = await axios.post(URI + 'registerUser', {
                userName: userName,
                email: email,
                password: password,
                wallet: wallet,
                idRole: role
            });
            if (resp.status === 200) {
                if (await insertIntoBlockchain(role, signer)) {
                    functionSuccess("Usuario Creado Satisfactoriamente");
                    navigate('/');
                } else {
                    const signature = await signer.signMessage(`Ha ocurrido un error y confirme para revertir la operación de creación de la cuenta ${wallet} e intentelo de nuevo`);
                    await axios.post(URI + 'revertCreate', {
                        wallet: wallet,
                        signature: signature
                    })
                    functionError("La cuenta no se ha podido crear en la blockchain, vuelve a intentarlo");

                }
            } else {
                functionError("La cuenta no se ha podido crear, vuelve a intentarlo");
            }
        } catch (error) {
            functionError("La cuenta no se ha podido crear, vuelve a intentarlo");
        }
    };

    const insertIntoBlockchain = async (idRole, signer) => {
        try {
            const systemManagmentContract = new ethers.Contract(systemManagementAddress.address, systemManagementAbi.abi, signer);
            let transaction;
            switch (idRole) {
                case "1":
                    transaction = await systemManagmentContract.registerUser("CONSUMER_ROLE");
                    break;
                case "2":
                    transaction = await systemManagmentContract.registerUser("PRODUCER_ROLE");
                    break;
                case "3":
                    transaction = await systemManagmentContract.registerUser("PROSUMER_ROLE");
                    break;
                default:
                    console.error("Rol no identificado:", idRole);
                    return false;
            }
            const receipt = await transaction.wait();
            return receipt.status === 1;
        } catch (error) {
            console.error("Ha ocurrido un error durante el registro del usuario en los contratos", error);
            return false;
        }
    };

    if (loading) {
        return (
            <div className='container fluid'>
                <h2>Loading...</h2>
            </div>
        )
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

                                        <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>

                                        <form className="mx-1 mx-md-4">

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <FaUser className="fas fa-user fa-lg me-3 fa-fw" />
                                                <div className="form-floating flex-fill mb-0">
                                                    <input type="text" id="floatingName"
                                                        className="form-control" placeholder='Your Name'
                                                        onChange={(e) => setName(e.target.value)}
                                                    />
                                                    <label htmlFor="floatingName">Tu Nombre</label>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <MdEmail className="fas fa-envelope fa-lg me-3 fa-fw" />
                                                <div className="form-floating flex-fill mb-0">
                                                    <input type="email" id="floatingEmail"
                                                        className="form-control" placeholder='Tu email'
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                    <label htmlFor="floatingEmail"> Email</label>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <FaWallet onClick={web3Handler}
                                                    className="fas fa-envelope fa-lg me-3 fa-fw"
                                                    style={{
                                                        cursor: 'pointer',
                                                        color: 'blue'
                                                    }} />
                                                <div className="form-floating flex-fill mb-0">
                                                    <input type="text" id="floatingEmail"
                                                        className="form-control" placeholder='Tu wallet'
                                                        value={account}
                                                    />
                                                    <label htmlFor="floatingEmail"> Wallet</label>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <RiLockPasswordFill className="fas fa-lock fa-lg me-3 fa-fw" />
                                                <div className="form-floating flex-fill mb-0">
                                                    <input type="password" id="floatingPassword"
                                                        className="form-control" placeholder='Your Password'
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                    <label htmlFor="floatingPassword">Contraseña</label>
                                                </div>
                                            </div>
                                            <div className='d-flex flex-row align-items-center mb-4'>
                                                <MdVerifiedUser className="fas fa-lock fa-lg me-3 fa-fw" />
                                                <select className='form-select form-select-lg mb-3'
                                                    aria-label='.form-select-lg example'
                                                    onChange={(e) => setRole(e.target.value)}>
                                                    <option selected>Selecciona un rol</option>
                                                    {roles.map(role => (
                                                        <option value={role.idRole} key={role.idRole}>{role.name}</option>
                                                    ))}
                                                </select>
                                            </div>



                                            <div className="form-check d-flex justify-content-center mb-5">
                                                <input className="form-check-input me-2" type="checkbox" value="" id="form2Example3c" />
                                                <label className="form-check-label" for="form2Example3">
                                                    I agree all statements in <a href="#!">Terms of service</a>
                                                </label>
                                            </div>

                                            <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                                <button type="button" className="btn btn-primary btn-lg" onClick={HandleCreateUser}>Register</button>
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
export default Register