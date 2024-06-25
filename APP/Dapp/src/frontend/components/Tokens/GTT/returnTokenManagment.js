import { ethers } from "ethers";
import { useWeb3 } from "../../web3Context";
import { Link } from "react-router-dom";
import { useState } from "react";


const ReturnTokenManagment = ({ functionSuccess, functionError, parseWei, parseEther, loadBalanceUser }) => {
    const [amount_return, setAmountReturn] = useState(0);
    const { tokenAddress, tokenAbi, signer } = useWeb3();
    const returnTokens = async (event) => {
        try {
            event.preventDefault();
            const token_contract = new ethers.Contract(tokenAddress.address, tokenAbi.abi, signer);
            const amount_wei = parseWei(amount_return);
            const transaction = await token_contract.returnTokens(amount_wei);
            const resp = await transaction.wait();
            if (resp.status === 1) {
                loadBalanceUser();
                return functionSuccess(`Has intercambiado ${amount_return} GTT tokens por ${amount_return} Stable Euro Tokens`)
            } else {
                return functionError("Error durante el intercambio, intentalo mas tarde")
            }
        } catch (error) {
            console.log("Error durante la devolución de tokens", error);
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
                                <h5 className="card-title text-center mb-4">Devolución de GTT Tokens</h5>
                                <form onSubmit={returnTokens}>
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
export default ReturnTokenManagment