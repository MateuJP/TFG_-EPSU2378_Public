
import '../../assets/styles/style.css'
import { FaBell, FaCommentAlt, FaUserCircle, FaUser, FaQuestion, FaInfoCircle, FaSearch, FaChevronCircleDown } from "react-icons/fa";
import { IoMdSettings, IoMdHelpCircle } from "react-icons/io";
import { RiLogoutBoxFill } from "react-icons/ri";
import { MdSmartphone, MdElectricBolt, MdEmail } from "react-icons/md";
import { FaCircle, FaFileContract, FaWallet, FaBitcoin } from "react-icons/fa6";
import { GiTrade } from "react-icons/gi";
import { FiAlignJustify } from "react-icons/fi";
import { Link } from 'react-router-dom';

import axios from 'axios';
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { useNavigate } from 'react-router';
import { useWeb3 } from './web3Context';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);
const StartScreen = ({ URI, children, functionError, functionSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [valitWallet, setValidWallet] = useState(false)
    const [user, setUser] = useState([]);
    let [notificaciones, setNotificaciones] = useState([]);
    const [notificaciones_broadcast, setBroadcastNotifications] = useState([]);
    const [notificaciones_personales, setNotificacionesPersonales] = useState([])
    const [token, setToken] = useState('');
    const [balanceUser, setBalance] = useState(0);
    const navigate = useNavigate();
    const mounted = useRef(false);
    const { web3Handler, account, tokenAddress, tokenAbi, signer } = useWeb3();

    const checkAuth = async () => {
        try {
            const _token = localStorage.getItem('token');
            if (!_token) throw new Error('No token');

            const resp = await axios.post(`${URI}auth/checkToken`, {}, {
                headers: { 'Authorization': _token }
            });

            if (resp.status === 200) {
                console.log(resp)
                setUser(resp.data);
                loadNotifications(_token, resp.data.idUser)
                return _token;
            }
            throw new Error('Invalid token');
        } catch (error) {
            setUser([]);
            setValidWallet(false)
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const loadNotifications = async (token, idUser) => {
        try {
            const resp = await axios.get(`${URI}auth/getSystemPersonalNotifications/${idUser}`, {
                headers: { 'Authorization': token }
            })
            const resp_broadcast = await axios.get(`${URI}auth/getUserBroadcastNotifications/${idUser}`, {
                headers: { 'Authorization': token }

            })
            console.log("Notificaciones : ", resp.data);
            console.log("Notificaciones Broadcast", resp_broadcast.data);
            setNotificacionesPersonales(resp.data);
            setBroadcastNotifications(resp_broadcast.data);
            setNotificaciones(resp.data.concat(resp_broadcast.data));
        } catch (error) {
            console.log("Error al cargar las notificaciones")

        }

    }
    const markAsRead = async () => {
        try {
            if (notificaciones_personales.length > 0) {
                try {
                    await axios.post(`${URI}auth/markNotificationPersonalAsRead`, {
                        idNotifications: notificaciones_personales.map(element => element.idNotificationPersonal),
                        idUser: user.idUser
                    }, {
                        headers: { 'Authorization': token }
                    });
                } catch (error) {
                    console.error(`Error marcando las notificaciones como leidas:`, error);
                }

            }

            if (notificaciones_broadcast.length > 0) {
                try {
                    await axios.post(`${URI}auth/markNotificationBroadcasrAsRead`, {
                        idNotifications: notificaciones_broadcast.map(element => element.idNotificationBroadcast),
                        idUser: user.idUser
                    }, {
                        headers: { 'Authorization': token }
                    });
                } catch (error) {
                    console.error(`Error marcando las notificaciones broadcast como leidas:`, error);
                }

            }

            notificaciones = [];

        } catch (error) {
            console.error('Error in markAsRead:', error);
        }
    };


    const shortenAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`;

    const handleWallet = async () => {
        await web3Handler();
    }

    const logOut = () => {
        localStorage.clear();
        setUser([]);
        setValidWallet(false);
        setToken('');
        navigate('/');
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const validToken = await checkAuth();
                setToken(validToken);
            } catch (error) {
                console.error('Authentication failed:', error);
            }
        };

        fetchData();
    }, [navigate]);


    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
        } else {
            if (account && user.wallet && account.toLowerCase() !== user.wallet.toLowerCase()) {
                setValidWallet(false);
                functionError(`La wallet no coincide con la wallet con la que te registraste, por favor conéctate con la wallet: ${user.wallet}`);
            } else {
                setValidWallet(true);
            }
        }
    }, [account]);

    if (loading) {
        return (
            <h1>Loading...</h1>
        )
    }
    return (
        <>
            <header id="header" className="header fixed-top d-flex align-items-center">

                <div className="d-flex align-items-center justify-content-between">
                    <a href="index.html" className="logo d-flex align-items-center">
                        <img src="assets/img/logo.png" alt="" />
                        <span className="d-none d-lg-block">E-trading</span>
                    </a>
                    <i className="bi bi-list toggle-sidebar-btn"><FiAlignJustify /></i>
                </div>

                <div className="search-bar">
                    <form className="search-form d-flex align-items-center" method="POST" action="#">
                        <input type="text" name="query" placeholder="Search" title="Enter search keyword" />
                        <button type="submit" title="Search"><i className="bi bi-search"><FaSearch /></i></button>
                    </form>
                </div>

                <nav className="header-nav ms-auto">
                    <ul className="d-flex align-items-center">

                        <li className="nav-item d-block d-lg-none">
                            <a className="nav-link nav-icon search-bar-toggle " href="#">
                                <i className="bi bi-search"><FaSearch /></i>
                            </a>
                        </li>
                        <li className='nav-item wallet-item'>
                            {(valitWallet && account) &&
                                <a
                                    href={`https://etherscan.io/address/${account}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="wallet-link"
                                    title={account}
                                >
                                    <i className="wallet-icon"><FaWallet /></i>
                                    <span className="wallet-address">{shortenAddress(account)}</span>
                                </a>
                            }
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
                                <i className="bi bi-bell"><FaBell /></i>
                                <span className="badge bg-primary badge-number">{notificaciones.length}</span>
                            </a>

                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <li className="dropdown-header">
                                    Tienes {notificaciones.length},notificaciones por leer
                                    <a href="#"><span className="badge rounded-pill bg-primary p-2 ms-2" onClick={markAsRead}>Marcar Todo</span></a>
                                </li>
                                {console.log(notificaciones)}
                                {notificaciones.map((notification, index) => (

                                    <>
                                        <li className="notification-item">
                                            <i className="bi bi-exclamation-circle text-warning"></i>
                                            <div>
                                                <h4>{`Notification ${index + 1}`}</h4>
                                                <p>{notification.content}</p>
                                            </div>
                                        </li>
                                        <li>
                                            <hr className="dropdown-divider" />
                                        </li>
                                    </>
                                ))}
                                <li className="dropdown-footer">
                                    <a href="#">Show all notifications</a>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item dropdown">

                            <a className="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
                                <i className="bi bi-chat-left-text"><FaCommentAlt /></i>
                                <span className="badge bg-success badge-number">3</span>
                            </a>

                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow messages">
                                <li className="dropdown-header">
                                    You have 3 new messages
                                    <a href="#"><span className="badge rounded-pill bg-primary p-2 ms-2">View all</span></a>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>

                                <li className="message-item">
                                    <a href="#">
                                        <img src="assets/img/messages-1.jpg" alt="" className="rounded-circle" />
                                        <div>
                                            <h4>Maria Hudson</h4>
                                            <p>Velit asperiores et ducimus soluta repudiandae labore officia est ut...</p>
                                            <p>4 hrs. ago</p>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>

                                <li className="message-item">
                                    <a href="#">
                                        <img src="assets/img/messages-2.jpg" alt="" className="rounded-circle" />
                                        <div>
                                            <h4>Anna Nelson</h4>
                                            <p>Velit asperiores et ducimus soluta repudiandae labore officia est ut...</p>
                                            <p>6 hrs. ago</p>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>

                                <li className="message-item">
                                    <a href="#">
                                        <img src="assets/img/messages-3.jpg" alt="" className="rounded-circle" />
                                        <div>
                                            <h4>David Muldon</h4>
                                            <p>Velit asperiores et ducimus soluta repudiandae labore officia est ut...</p>
                                            <p>8 hrs. ago</p>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>

                                <li className="dropdown-footer">
                                    <a href="#">Show all messages</a>
                                </li>

                            </ul>

                        </li>

                        <li className="nav-item dropdown pe-3">

                            <a className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
                                <i className='bi bi-person'><FaUserCircle style={{ height: '36px' }} /></i>
                            </a>

                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                                <li className="dropdown-header">
                                    <h6>{user.userName}</h6>
                                    <span>{user.ROLE.name}</span>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>

                                <li>
                                    <Link className="dropdown-item d-flex align-items-center" to="/settingsAccount">
                                        <i className="bi bi-person"><FaUser /></i>
                                        <span>My Profile</span>
                                    </Link>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>

                                <li>
                                    <Link className="dropdown-item d-flex align-items-center" to="/settingsAccount">
                                        <i className="bi bi-gear"><IoMdSettings /></i>
                                        <span>Account Settings</span>
                                    </Link>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>

                                <li>
                                    <a className="dropdown-item d-flex align-items-center" href="pages-faq.html">
                                        <i className="bi bi-question-circle"><IoMdHelpCircle /></i>
                                        <span>Need Help?</span>
                                    </a>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <a className="dropdown-item d-flex align-items-center"
                                        style={{ cursor: 'pointer' }}
                                        onClick={handleWallet}
                                    >
                                        <i className='bi bi-box-arrow-right'><FaWallet /></i>
                                        <span>Conect Wallet</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item d-flex align-items-center"
                                        style={{ cursor: 'pointer' }}
                                        onClick={logOut}
                                    >
                                        <i className="bi bi-box-arrow-right"><RiLogoutBoxFill /></i>
                                        <span>Sign Out</span>
                                    </a>
                                </li>
                            </ul>
                        </li>

                    </ul>
                </nav>

            </header>
            <aside id="sidebar" className="sidebar">
                <ul className="sidebar-nav" id="sidebar-nav">
                    <li className="nav-item">
                        <a className="nav-link " href="index.html">
                            <i className="bi bi-grid"></i>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link collapsed" data-bs-target="#components-nav" data-bs-toggle="collapse" href="#">
                            <i className="bi bi-menu-button-wide"><GiTrade /></i><span>E-Trading</span><i className="bi bi-chevron-down ms-auto"><FaChevronCircleDown /></i>
                        </a>
                        <ul id="components-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
                            <li>
                                {user.ROLE.name !== 'Consumer' &&
                                    <Link to="/offers/send">
                                        <i className="bi bi-circle"><FaCircle /></i><span>Hacer oferta</span>
                                    </Link>
                                }

                            </li>
                            <li>
                                {user.ROLE.name !== 'Consumer' &&
                                    <Link to="/offers/reveal">
                                        <i className="bi bi-circle"><FaCircle /></i><span>Revelar oferta</span>
                                    </Link>
                                }
                            </li>
                            <li>
                                {user.ROLE.name !== 'Consumer' &&
                                    <Link to="/offers/manage">
                                        <i className="bi bi-circle"><FaCircle /></i><span>Mis ofertas</span>
                                    </Link>
                                }
                            </li>
                            <li>

                                <Link to="/viewMarketOffers">
                                    <i className="bi bi-circle"><FaCircle /></i><span>Ver ofertas</span>
                                </Link>
                            </li>

                            <li>
                                <a href="components-breadcrumbs.html">
                                    <i className="bi bi-circle"><FaCircle /></i><span>Ver Intercambios</span>
                                </a>
                            </li>
                            <li>
                                <a href="components-alerts.html">
                                    <i className="bi bi-circle"><FaCircle /></i><span>Ver Solicitudes</span>
                                </a>
                            </li>
                            <li>
                                <a href="components-accordion.html">
                                    <i className="bi bi-circle"><FaCircle /></i><span>Hacer Solicitud</span>
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link collapsed" data-bs-target="#forms-nav" data-bs-toggle="collapse" href="#">
                            <i className="bi bi-journal-text"><MdSmartphone /></i><span>Smart Meters</span><i className="bi bi-chevron-down ms-auto"><FaChevronCircleDown /></i>
                        </a>
                        <ul id="forms-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
                            <li>
                                <Link to="/smartMeters/add">
                                    <i className="bi bi-circle"><FaCircle /></i><span>Añadir</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/smartMeters/edit">
                                    <i className="bi bi-circle"><FaCircle /></i><span>Editar</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/smartMeters/remove">
                                    <i className="bi bi-circle"><FaCircle /></i><span>Eliminar</span>
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link collapsed" data-bs-target="#charts-nav" data-bs-toggle="collapse" href="#">
                            <i className="bi bi-bar-chart"><FaBitcoin /></i><span>Tokens Managment</span><i className="bi bi-chevron-down ms-auto"><FaChevronCircleDown /></i>
                        </a>
                        <ul id="charts-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
                            <li>
                                <Link to="/tokens/set">
                                    <i className="bi bi-circle"><FaCircle /></i><span>SET Tokens</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/tokens/gtt">
                                    <i className="bi bi-circle"><FaCircle /></i><span>GTT tokens</span>
                                </Link>
                            </li>

                        </ul>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link collapsed" data-bs-target="#icons-nav" data-bs-toggle="collapse" href="#">
                            <i className="bi bi-gem"><FaFileContract /></i><span>Contratos</span><i className="bi bi-chevron-down ms-auto"><FaChevronCircleDown /></i>
                        </a>
                        <ul id="icons-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
                            <li>
                                <Link to="/agreement/viewAll/">

                                    <i className="bi bi-circle"><FaCircle /></i><span>Mis Acuerdos</span>
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li className="nav-heading">Pages</li>
                    <li className="nav-item">
                        <a className="nav-link collapsed" href="/settingsAccount">
                            <i className="bi bi-person"><FaUserCircle /></i>
                            <span>Perfil</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link collapsed" href="users-profile.html">
                            <i className="bi bi-person"><FaInfoCircle /></i>
                            <span>Sobre E-Trading</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link collapsed" href="pages-faq.html">
                            <i className="bi bi-question-circle"><FaQuestion /></i>
                            <span>F.A.Q</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link collapsed" href="pages-contact.html">
                            <i className="bi bi-envelope"><MdEmail /></i>
                            <span>Contact</span>
                        </a>
                    </li>
                </ul>
            </aside>

            <UserContext.Provider value={{ user, token, valitWallet, account, balanceUser }}>
                <main id='main' className='main'>
                    {children}
                </main>
            </UserContext.Provider>

        </>
    )
}
export default StartScreen;