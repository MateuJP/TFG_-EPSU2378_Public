
import BuyStableTokensManagment from "./buyStableTokens";
import ReturnStableTokens from "./returnStableTokens";
import AllowanceManage from "./AllowanceManagment";
import { useEffect, useState } from "react";
import { useUser } from "../../admin_start";
import { useWeb3 } from "../../web3Context";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

const SETViewComponent = ({ functionSuccess, functionError, parseEther, parseWei }) => {
    const [balanceUSer, setBalanceUser] = useState(0);
    const [allowance, setAllowance] = useState(0);
    const { tokenAddress, stableCoinAddress, stableCoinAbi } = useWeb3();
    const { user } = useUser();

    const loadAllowance = async () => {
        try {
            const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
            const StableCoinContract = new ethers.Contract(stableCoinAddress.address, stableCoinAbi.abi, provider);
            const allowance = await StableCoinContract.allowance(user.wallet, tokenAddress.address);
            setAllowance(parseEther(allowance));
        } catch (error) {
            console.log("Error", error)
            functionError("Ha ocurrido un problema, revisa tu conexión a metamask y pruebalo de nuevo");

        }
    }
    const loadBalanceUser = async () => {
        try {
            const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
            const contract_token = new ethers.Contract(stableCoinAddress.address, stableCoinAbi.abi, provider);
            const _balance_wei = await contract_token.balanceOf(user.wallet);
            setBalanceUser(parseEther(_balance_wei))


        } catch (error) {
            console.log("Error", error)
        }
    }
    useEffect(() => {
        loadAllowance();
        loadBalanceUser();
    }, [])

    return (
        <>
            <div className="pagetitle">
                <h1>SET Tokens</h1>
                <nav>
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/panelControl">Home</Link></li>
                    </ol>
                </nav>
            </div>

            <section className="section profile">
                <div className="row d-flex align-items-stretch">
                    <div className="col-xl-5">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">Información SET Tokens</h5>

                                <div className="row">
                                    <div className="col-md-6 label">Relación SET-ETH</div>
                                    <div className="col-md-6">
                                        <span className="text-primary">1 SET = 0,00030 ETH</span>
                                    </div>
                                </div>

                                <div className="row" style={{ marginTop: '2rem' }}>
                                    <div className="col-md-6 label">SET-GTT</div>
                                    <div className="col-md-6">
                                        <span className="text-primary">1 GTT = 1 SET</span>
                                    </div>
                                </div>

                                <div className="row" style={{ marginTop: '2rem' }}>
                                    <div className="col-md-6 label">Balance Tokens</div>
                                    <div className="col-md-6">
                                        <span className="text-primary">{balanceUSer} SET</span>
                                    </div>
                                </div>

                                <div className="row" style={{ marginTop: '2rem' }}>
                                    <div className="col-md-6 label">Tokens autorizados</div>
                                    <div className="col-md-6">
                                        <span className="text-primary">{allowance} SET</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="col-xl-7">

                        <div className="card h-100">
                            <div className="card-body pt-3">
                                <ul className="nav nav-tabs nav-tabs-bordered">
                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#set-buy">Comprar Tokens</button>
                                    </li>

                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#set-return">Devolver Tokens</button>
                                    </li>

                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#set-allowance">Autorizar Plataforma</button>
                                    </li>

                                </ul>
                                <div className="tab-content pt-2">
                                    <div className="tab-pane fade profile-edit pt-3" id="set-buy">
                                        <BuyStableTokensManagment
                                            functionError={functionError}
                                            functionSuccess={functionSuccess}
                                            parseEther={parseEther}
                                            parseWei={parseWei}
                                            loadBalanceUser={loadBalanceUser}
                                        />
                                    </div>

                                    <div className="tab-pane fade pt-3" id="set-return">
                                        <ReturnStableTokens
                                            functionError={functionError}
                                            functionSuccess={functionSuccess}
                                            parseEther={parseEther}
                                            parseWei={parseWei}
                                            loadBalanceUser={loadBalanceUser}
                                        />

                                    </div>

                                    <div className="tab-pane fade pt-3" id="set-allowance">
                                        <AllowanceManage
                                            functionError={functionError}
                                            functionSuccess={functionSuccess}
                                            parseEther={parseEther}
                                            parseWei={parseWei}
                                            loadAllowance={loadAllowance}
                                        />
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
export default SETViewComponent;