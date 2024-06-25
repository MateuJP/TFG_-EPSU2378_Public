import { useState, useEffect } from "react";
import { useUser } from "../../admin_start";
import { useWeb3 } from "../../web3Context";
import { ethers } from "ethers";
import { Link } from "react-router-dom";


const AllowanceManage = ({ functionSuccess, functionError, parseEther, parseWei, loadAllowance }) => {
    const [amount_allowance, setAmountAllowance] = useState(0);
    const { tokenAddress, tokenAbi, stableCoinAddress, stableCoinAbi, signer } = useWeb3();
    const { user, balanceUser } = useUser();

    const increaseAllowance = async () => {
        try {
            const StableCoinContract = new ethers.Contract(stableCoinAddress.address, stableCoinAbi.abi, signer);
            const amount_wei = parseWei(amount_allowance);
            const transacion = await StableCoinContract.increaseAllowance(tokenAddress.address, amount_wei);
            const resp = await transacion.wait();
            if (resp.status === 1) {
                loadAllowance();
                return functionSuccess("La operación se ha llevado a cabo satisfactoriamente")
            } else {
                return functionError("Ha ocrurrido un error, intentalo mas tarde")
            }
        } catch (error) {
            console.log("Error", error)
            functionError("Ha ocurrido un problema, revisa tu conexión a metamask y pruebalo de nuevo");
        }
    }

    const decreaseAllowance = async () => {
        try {
            const StableCoinContract = new ethers.Contract(stableCoinAddress.address, stableCoinAbi.abi, signer);
            const amount_wei = parseWei(amount_allowance);
            const transaction = await StableCoinContract.decreaseAllowance(tokenAddress.address, amount_wei);
            const resp = await transaction.wait();
            if (resp.status === 1) {
                loadAllowance();
                return functionSuccess("La operación se ha llevado a cabo satisfactoriamente");
            } else {
                return functionError("Ha ocurrido un error, intentalo mas tarde")
            }
        } catch (error) {
            console.log("Error", error)
            functionError("Ha ocurrido un problema, revisa tu conexión a metamask y pruebalo de nuevo");
        }
    }
    return (
        <>
            <main>
                <section className="section">
                    <div className="d-flex">
                        <div className="card mb-4 shadow-sm w-100">
                            <div className="card-body">
                                <h5 className="card-title text-center mb-4">Autorización de Tokens</h5>
                                <form>
                                    <div className="mb-3">
                                        <input type="text" className="form-control"
                                            placeholder="Cantidad de tokens a autorizar"
                                            onChange={(e) => setAmountAllowance(e.target.value)} />
                                    </div>
                                    <div className="d-flex justify-content-around">
                                        <button type="button" onClick={increaseAllowance} className="btn btn-success">Aumentar Autorización</button>

                                        <button type="button" onClick={decreaseAllowance} className="btn btn-danger">Disminuir Autorización</button>
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
export default AllowanceManage;