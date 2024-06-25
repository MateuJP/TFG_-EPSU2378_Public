
import BuyTokenManagment from "./buyTokenManagment";
import ReturnTokenManagment from "./returnTokenManagment";
import { useEffect, useState } from "react";
import { useUser } from "../../admin_start";
import { useWeb3 } from "../../web3Context";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

const GTTViewComponent = ({ functionSuccess, functionError, parseEther, parseWei }) => {
    const [balanceUSer, setBalanceUser] = useState(0);
    const { tokenAddress, tokenAbi, } = useWeb3();
    const { user } = useUser();

    const loadBalanceUser = async () => {
        try {
            const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
            const contract_token = new ethers.Contract(tokenAddress.address, tokenAbi.abi, provider);
            const _balance_wei = await contract_token.balanceOf(user.wallet);
            setBalanceUser(parseEther(_balance_wei))


        } catch (error) {
            console.log("Error", error)
        }
    }
    useEffect(() => {
        loadBalanceUser();
    }, [])

    return (
        <>
            <div className="pagetitle">
                <h1>GTT Tokens</h1>
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
                                <h5 className="card-title">Información GTT Tokens</h5>


                                <div className="row" style={{ marginTop: '2rem' }}>
                                    <div className="col-md-6 label">Relación GTT-SET</div>
                                    <div className="col-md-6">
                                        <span className="text-primary">1 GTT = 1 SET</span>
                                    </div>
                                </div>

                                <div className="row" style={{ marginTop: '2rem' }}>
                                    <div className="col-md-6 label">Balance Tokens GTT</div>
                                    <div className="col-md-6">
                                        <span className="text-primary">{balanceUSer} GTT</span>
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

                                </ul>
                                <div className="tab-content pt-2">
                                    <div className="tab-pane fade profile-edit pt-3" id="set-buy">
                                        <BuyTokenManagment
                                            functionError={functionError}
                                            functionSuccess={functionSuccess}
                                            parseEther={parseEther}
                                            parseWei={parseWei}
                                            loadBalanceUser={loadBalanceUser}
                                        />
                                    </div>

                                    <div className="tab-pane fade pt-3" id="set-return">
                                        <ReturnTokenManagment
                                            functionError={functionError}
                                            functionSuccess={functionSuccess}
                                            parseEther={parseEther}
                                            parseWei={parseWei}
                                            loadBalanceUser={loadBalanceUser}
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
export default GTTViewComponent;