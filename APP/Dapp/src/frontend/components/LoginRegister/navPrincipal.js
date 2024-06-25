import img from '../../../assets/logo.png'

const NavPrincipal = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-body-tertiary nav_start">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">
                    <img
                        src={img}
                        height="50"
                        alt="MDB Logo"
                        loading="lazy"
                    />
                </a>


                <button
                    data-mdb-collapse-init
                    className="navbar-toggler"
                    type="button"
                    data-mdb-target="#navbarRightAlignExample"
                    aria-controls="navbarRightAlignExample"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <i className="fas fa-bars"></i>
                </button>
                <div className="collapse navbar-collapse" id="navbarRightAlignExample">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a className="nav-link active link_nav_principal" style={{ color: 'white' }} aria-current="page" href="#">Sobre nostros</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link active link_nav_principal" style={{ color: 'white' }} href="/registrar">¿Porque blockchain?</a>
                        </li>

                    </ul>
                </div>
            </div>

        </nav>
    )

}
export default NavPrincipal

