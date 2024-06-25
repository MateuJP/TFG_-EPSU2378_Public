import { ethers } from "ethers";
import { useWeb3 } from "../web3Context";


const SendMoney = ({ functionSuccess, functionError, contractAddress, totalPay, parseWei, parseEther }) => {
    const { tokenAddress, tokenAbi, signer } = useWeb3();

    const handleSend = async (e) => {
        try {
            e.preventDefault();
            const contract = new ethers.Contract(tokenAddress.address, tokenAbi.abi, signer);
            const totalPay_wei = parseWei(totalPay);
            console.log(totalPay_wei);
            console.log(contractAddress);
            const transaction = await contract.transfer(contractAddress, totalPay_wei);
            const tx = await transaction.wait();
            if (tx.status === 1) {
                return functionSuccess(`Has envidado ${totalPay} GTT tokens al contrato`);
            } else {
                return functionError("Ha ocurrido un error duarante el envio de tokens, revisa tu conexión a metamask y tu saldo")
            }

        } catch (error) {
            console.log("Error", error)
            return functionError("Ha ocurrido un error duarante el envio de tokens, revisa tu conexión a metamask y tu saldo")

        }
    }
    return (
        <>
            <main>
                <section className="section">
                    <div className="d-flex">
                        <div className="card mb-4 shadow-sm w-100">
                            <div className="card-body">
                                <h5 className="card-title text-center mb-4">Enviar Tokens al Acuerdo</h5>
                                <form onSubmit={handleSend}>
                                    <div className="mb-3">
                                        <input type="text" className="form-control"
                                            placeholder="Cantidad de tokens a comprar"
                                            value={totalPay} />
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-primary btn-lg">Mandar fondos</button>
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
export default SendMoney;