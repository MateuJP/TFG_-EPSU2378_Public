import { useState } from "react";
import { useWeb3 } from "../../web3Context"
import { ethers } from "ethers";


const BuyTokenManagment = ({ functionSuccess, functionError, parseWei, parseEther, loadBalanceUser }) => {
    const [amount_buy, setAmountBuy] = useState(0);
    const { tokenAddress, tokenAbi, stableCoinAddress, stableCoinAbi, signer } = useWeb3();

    const buyTokens = async (event) => {
        try {
            event.preventDefault();
            const StableCoinContract = new ethers.Contract(stableCoinAddress.address, stableCoinAbi.abi, signer);
            const TokenContract = new ethers.Contract(tokenAddress.address, tokenAbi.abi, signer);
            const amount_wei = parseWei(amount_buy);
            console.log(tokenAddress.address)
            console.log(amount_wei)
            console.log(signer)
            console.log(StableCoinContract);
            const res = await StableCoinContract.price_token_ether();
            console.log("Prueba", res.toString())
            let transacion = await StableCoinContract.approve(tokenAddress.address.toString(), amount_wei);
            let receipt = await transacion.wait();
            if (receipt.status === 1) {
                transacion = await TokenContract.buyTokens(amount_wei);
                receipt = await transacion.wait();
                if (receipt.status === 1) {
                    loadBalanceUser();
                    return functionSuccess("Tokens Comprados staisfactoriamente");

                }
                return functionError("No se han podido completar la compra tokens, intentalo mas tarde");

            } else {
                return functionError("Ha ocurrido un error durante la compra, intentalo mas tarde")
            }
        } catch (error) {
            console.log("Error en la compra", error);
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
                                <h5 className="card-title text-center mb-4">Compra de GTT Tokens</h5>
                                <form onSubmit={buyTokens}>
                                    <div className="mb-3">
                                        <input type="text" className="form-control"
                                            placeholder="Cantidad de tokens a comprar"
                                            onChange={(e) => setAmountBuy(e.target.value)} />
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-primary btn-lg">Comprar</button>
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
export default BuyTokenManagment
