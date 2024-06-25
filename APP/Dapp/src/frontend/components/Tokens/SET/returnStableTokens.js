import { useState, useEffect } from "react";
import { useWeb3 } from "../../web3Context";
import { useUser } from "../../admin_start";
import { ethers } from "ethers";
import { Link } from "react-router-dom";


const ReturnStableTokens = ({ functionSuccess, functionError, parseWei, parseEther, loadBalanceUser }) => {
    const [amount_return, setAmountReturn] = useState(0);
    const { stableCoinAddress, stableCoinAbi, signer } = useWeb3();
    const { user } = useUser();

    const returnStableTokens = async (event) => {
        try {
            event.preventDefault();
            const stableCoinContract = new ethers.Contract(stableCoinAddress.address, stableCoinAbi.abi, signer);
            const amount_wei = parseWei(amount_return);
            const transaction = await stableCoinContract.returnTokens(amount_wei);
            const resp = await transaction.wait();
            if (resp.status === 1) {
                loadBalanceUser();
                return functionSuccess(`La devolución de ${amount_return} Stable Euro Tokens se ha llevaodo a cabo satisfacotriamente`)
            } else {
                return functionError("La compra de Stable Euro Tokens no se ha podido llevar a cabo")
            }
        } catch (error) {
            console.log("Error");
            return functionError("Ha ocurrido un problema, revisa tu conexión a metamask y pruebalo de nuevo");

        }
    }
    return (
        <>
            <main>


                <section className="section">
                    <div className="d-flex">
                        <div className="card mb-4 shadow-sm w-100">
                            <div className="card-body">
                                <h5 className="card-title text-center mb-4">Devolución de Tokens</h5>
                                <form onSubmit={returnStableTokens}>
                                    <div className="mb-3">
                                        <input type="text" className="form-control"
                                            placeholder="Cantidad de tokens a devolver"
                                            onChange={(e) => setAmountReturn(e.target.value)} />
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-primary btn-lg">Devolver</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>


            </main>
        </>
    );


}

export default ReturnStableTokens;