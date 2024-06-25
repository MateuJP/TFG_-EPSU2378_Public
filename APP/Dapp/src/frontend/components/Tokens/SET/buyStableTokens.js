import { useEffect, useState } from "react";
import { useWeb3 } from "../../web3Context";
import { useUser } from "../../admin_start";
import { ethers } from "ethers";
import { Link } from "react-router-dom";


const BuyStableTokensManagment = ({ functionSuccess, functionError, parseWei, parseEther, loadBalanceUser }) => {
    const [amount_buy, setAmountBuy] = useState(0);
    const [balanceUSer, setBalanceUser] = useState(0);
    const { stableCoinAddress, stableCoinAbi, signer } = useWeb3();
    const { user } = useUser();

    const buyStableTokens = async (event) => {
        try {
            event.preventDefault();
            const stableCoinContract = new ethers.Contract(stableCoinAddress.address, stableCoinAbi.abi, signer);
            const price_tokens_ether = parseEther(await stableCoinContract.price_token_ether());
            const totalCostInEther = parseEther(ethers.utils.parseEther(price_tokens_ether).mul(amount_buy));
            const totalCostInWei = parseWei(totalCostInEther);

            const amount_wei = parseWei(amount_buy);
            const transaction = await stableCoinContract.buyStableTokens(amount_wei, { value: (totalCostInWei) });
            const resp = await transaction.wait();
            if (resp.status === 1) {
                loadBalanceUser();
                return functionSuccess(`La compra de ${amount_buy} Stable Euro Tokens se ha llevado a cabo satisfactoriamente`)
            } else {
                return functionError("La compra de Stable Euro Tokens no se ha podido llevar a cabo")
            }
        } catch (error) {
            console.log("Error", error);
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
                                <h5 className="card-title text-center mb-4">Compra de Tokens</h5>
                                <form onSubmit={buyStableTokens}>
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

    )

}

export default BuyStableTokensManagment;

