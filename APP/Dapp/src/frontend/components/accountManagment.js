import { useEffect, useState } from "react";
import { useUser } from "./admin_start"
import { FaUserCircle, FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";
import axios from 'axios';
import { Link } from "react-router-dom";


const AccountManagment = ({ URI, functionSuccess, funcionError }) => {
    const [email, setEmail] = useState('');
    const [wallet, setWallet] = useState('');
    const [userName, setUserName] = useState('');
    const [twitter, setTwitter] = useState('');
    const [facebook, setFacebook] = useState('');
    const [instagram, setInstagram] = useState('');
    const [password, setPassword] = useState('');
    const [newPassowrd, setNewPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const [roles, setRoles] = useState([]);
    const [role, setRole] = useState(0);
    const { user, token } = useUser();
    const [recivePersonalNotifications, setRecivePersonalNotifications] = useState(user.aceptPersonalNotification);
    const [publicProfile, setIsPublic] = useState(user.publicProfile);

    const loadRoles = async () => {
        try {
            const resp = await axios.get(URI + 'getRoles');
            setRoles(resp.data)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        loadRoles();
    }, [])


    const handleUpdateSettings = async (event) => {
        try {
            event.preventDefault();
            const resp = await axios.post(URI + 'auth/updateSettings', {
                idUser: user.idUser,
                email: email || user.email,
                wallet: wallet || user.wallet,
                idRole: role || user.role,
                twitterAccount: twitter || user.twitterAccount,
                facebookAccount: facebook || user.facebookAccount,
                instagramAccount: instagram || user.instagramAccount

            }, {
                headers: { 'Authorization': token }
            });
            if (resp.status === 200) {
                functionSuccess('Registro Actualizado Satisfactoriamente')
            } else {
                funcionError("Ha ocurrido un error durante la actualización")
            }

        } catch (error) {
            console.log("Ha ocurrido un error durante la actualización", error)
        }
    }

    const handleUpdatePermision = async (event) => {
        try {
            event.preventDefault();
            const resp = await axios.post(URI + 'auth/updatePermision', {
                idUser: user.idUser,
                publicProfile: publicProfile || user.publicProfile,
                aceptPersonalNotification: recivePersonalNotifications || user.aceptPersonalNotification
            }, {
                headers: { 'Authorization': token }
            })
            if (resp.status === 200) {
                functionSuccess('Registro Actualizado Satisfactoriamente')
            } else {
                funcionError("Ha ocurrido un error durante la actualización")
            }
        } catch (error) {
            console.log("Ha ocurrido un error durante la actualización", error)

        }
    }

    const handleChangePassword = async (event) => {
        try {
            event.preventDefault();
            if (newPassowrd === checkPassword) {
                const resp = await axios.post(URI + 'auth/changePassword', {
                    idUser: user.idUser,
                    password: password,
                    newPassword: newPassowrd
                }, {
                    headers: { 'Authorization': token }
                });
                if (resp.status === 200) {
                    functionSuccess('Contraseña Cambiada Correctamente')
                } else {
                    funcionError("Ha ocurrido un error durante el cambio de contraseña")
                }

            } else {
                funcionError("Las nuevas contraseñas no coinicen");
            }

        } catch (error) {
            console.log("Ha ocurrido un error durante el cambio de contraseña", error)

        }
    }
    return (
        <>
            <div className="pagetitle">
                <h1>Profile</h1>
                <nav>
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/panelControl">Home</Link></li>
                    </ol>
                </nav>
            </div>

            <section className="section profile">
                <div className="row">
                    <div className="col-xl-4">

                        <div className="card">
                            <div className="card-body profile-card pt-4 d-flex flex-column align-items-center">

                                <i style={{ fontSize: '50px' }} className="bi bi-person"><FaUserCircle /></i>
                                <h2>{user.userName}</h2>
                                <h3>{user.ROLE.name}</h3>
                                <div className="social-links mt-2">
                                    <a href="#" className="twitter"><FaTwitter /></a>
                                    <a href="#" className="facebook"><FaFacebook /></a>
                                    <a href="#" className="instagram"><FaInstagram /></a>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="col-xl-8">

                        <div className="card">
                            <div className="card-body pt-3">
                                <ul className="nav nav-tabs nav-tabs-bordered">

                                    <li className="nav-item">
                                        <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-overview">Overview</button>
                                    </li>

                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit">Edit Profile</button>
                                    </li>

                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-settings">Settings</button>
                                    </li>

                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-change-password">Change Password</button>
                                    </li>

                                </ul>
                                <div className="tab-content pt-2">

                                    <div className="tab-pane fade show active profile-overview" id="profile-overview">
                                        <h5 className="card-title">Profile Details</h5>

                                        <div className="row">
                                            <div className="col-lg-3 col-md-4 label ">Full Name</div>
                                            <div className="col-lg-9 col-md-8">{user.userName}</div>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-3 col-md-4 label">Rol</div>
                                            <div className="col-lg-9 col-md-8">{user.ROLE.name}</div>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-3 col-md-4 label">email</div>
                                            <div className="col-lg-9 col-md-8">{user.email}</div>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-3 col-md-4 label">Wallet</div>
                                            <div className="col-lg-9 col-md-8">{user.wallet}</div>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade profile-edit pt-3" id="profile-edit">

                                        <form onSubmit={handleUpdateSettings}>

                                            <div className="row mb-3">
                                                <label for="fullName" className="col-md-4 col-lg-3 col-form-label">User Name</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="fullName" type="text" className="form-control" id="fullName" value={user.userName} onChange={(e) => setUserName(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label for="company" className="col-md-4 col-lg-3 col-form-label">Email</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="company" type="text" className="form-control" id="email" value={user.email} onChange={(e) => setEmail(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label for="Job" className="col-md-4 col-lg-3 col-form-label">Wallet</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="job" type="text" className="form-control" id="Job" value={user.wallet} onChange={(e) => setWallet(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label for="Country" className="col-md-4 col-lg-3 col-form-label">Role</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <select className='form-select'
                                                        aria-label='.form-select-lg example'
                                                        onChange={(e) => setRole(e.target.value)}>
                                                        <option value={user.ROLE.idRole} selected>{user.ROLE.name}</option>
                                                        {roles.filter(role => role.idRole != user.ROLE.idRole).map(role => (
                                                            <option value={role.idRole} key={role.idRole}>{role.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <label for="Twitter" className="col-md-4 col-lg-3 col-form-label">Twitter Profile</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="twitter" type="text" className="form-control" id="Twitter" value={user.twitterAccount}
                                                        onChange={(e) => setTwitter(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label for="Facebook" className="col-md-4 col-lg-3 col-form-label">Facebook Profile</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="facebook" type="text" className="form-control" id="Facebook" value={user.facebookAccount}
                                                        onChange={(e) => setFacebook(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label for="Instagram" className="col-md-4 col-lg-3 col-form-label">Instagram Profile</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="instagram" type="text" className="form-control" id="Instagram" value={user.instagramAccount}
                                                        onChange={(e) => setInstagram(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <button type="submit" className="btn btn-primary">Save Changes</button>
                                            </div>
                                        </form>

                                    </div>

                                    <div className="tab-pane fade pt-3" id="profile-settings">

                                        <form onSubmit={handleUpdatePermision}>

                                            <div className="row mb-3">
                                                <div className="col-md-8 col-lg-9">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="changesMade"
                                                            checked={publicProfile === 1}
                                                            onChange={(e) => setIsPublic(e.target.checked ? '1' : '0')}
                                                        />
                                                        <label className="form-check-label" for="changesMade">
                                                            Perfil Público
                                                        </label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input className="form-check-input"
                                                            type="checkbox"
                                                            id="newProducts"
                                                            checked={recivePersonalNotifications === 1}
                                                            onChange={(e) => setRecivePersonalNotifications(e.target.checked ? 1 : 0)}

                                                        />

                                                        <label className="form-check-label" for="newProducts">
                                                            Aceptar Notificaciones Personales
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <button type="submit" className="btn btn-primary">Save Changes</button>
                                            </div>
                                        </form>

                                    </div>

                                    <div className="tab-pane fade pt-3" id="profile-change-password">
                                        <form onSubmit={handleChangePassword}>

                                            <div className="row mb-3">
                                                <label for="currentPassword" className="col-md-4 col-lg-3 col-form-label">Current Password</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="password" type="password" className="form-control" id="currentPassword"
                                                        onChange={(e) => setPassword(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label for="newPassword" className="col-md-4 col-lg-3 col-form-label">New Password</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="newpassword" type="password" className="form-control" id="newPassword"
                                                        onChange={(e) => setNewPassword(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <label for="renewPassword" className="col-md-4 col-lg-3 col-form-label">Re-enter New Password</label>
                                                <div className="col-md-8 col-lg-9">
                                                    <input name="renewpassword" type="password" className="form-control" id="renewPassword"
                                                        onChange={(e) => setCheckPassword(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <button type="submit" className="btn btn-primary">Change Password</button>
                                            </div>
                                        </form>

                                    </div>

                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>

        </>

    )
}
export default AccountManagment