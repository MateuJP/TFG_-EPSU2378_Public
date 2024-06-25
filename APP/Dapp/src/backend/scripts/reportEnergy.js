const { ethers } = require("hardhat");
const abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenContract",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_consumer",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_producer",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_priceKwH",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_totalEnergy",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "_smConsumers",
                "type": "address[]"
            },
            {
                "internalType": "address[]",
                "name": "_smProducers",
                "type": "address[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "smartMeter",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "EnergyReceived",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "smartMeter",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "EnergySent",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "consumer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "producer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "energyExchanged",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "totalPaid",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "totalReturned",
                "type": "uint256"
            }
        ],
        "name": "ExchangeFinalized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "reporter",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "discrepancy",
                "type": "uint256"
            }
        ],
        "name": "IncidentReported",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "IncidentResolved",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "producer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountPaid",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amountReturned",
                "type": "uint256"
            }
        ],
        "name": "PaymentClaimed",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "smart_meter",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "typeUser",
                "type": "uint256"
            }
        ],
        "name": "addSmartMeter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "balanceSmartContract",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "cancelAgreement",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "consumer",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "consumerConfirmed",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "consumerHasPaid",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentIncident",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "discrepancyAmount",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "reporter",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "energyProvided",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "energyReceived",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "feePlatform",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "incidentActive",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "priceKwH",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "producer",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "producerConfirmed",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "reportEnergyProvided",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "reportEnergyReceived",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "reportIncident",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "reportStartTransfer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "energy_amount",
                "type": "uint256"
            }
        ],
        "name": "resolveIncident",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "smart_meter",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "typeUser",
                "type": "uint256"
            }
        ],
        "name": "revokeSmartMeter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "smartMeterConsumer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "smartMeterProducer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "tokenContract",
        "outputs": [
            {
                "internalType": "contract TokenContract",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalEnergy",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
const axios = require('axios');
async function main() {
    const [contractAddress, energyAmount, publicKey, send] = process.argv.slice(2);

    if (!contractAddress || !energyAmount || !publicKey) {
        console.error("Usage: npx hardhat run scripts/reportEnergy.js --network ganache <contractAddress> <energyAmount> <publicKey> <send>");
        process.exit(1);
    }

    const accounts = await ethers.getSigners();
    let account;
    let found = false;

    for (const _account of accounts) {
        if (_account.address === publicKey) {
            account = _account;
            found = true;
            break;
        }
    }

    if (!found) {
        console.error("Wallet no válida");
        process.exit(1);
    }
    const energy_wei = ethers.utils.parseEther(energyAmount.toString(), 18).toString();
    const agreement = new ethers.Contract(contractAddress, abi, account);

    agreement.on("ExchangeFinalized", async (consumer, producer, energyProvided, paymentAfterFee, refund, event) => {
        console.log("El intercambio ya ha finalizado");
        try {
            const response = await axios.post("http://localhost:8000/smartFinishAgreement", {
                contractAddress: contractAddress
            });
            console.log("Respuesta del servidor", response.data);
        } catch (error) {
            console.error('Error al enviar la petición HTTP:', error);

        }
    })


    let tx;
    if (send === "true") {
        tx = await agreement.connect(account).reportEnergyProvided(energy_wei);
    } else {
        tx = await agreement.connect(account).reportEnergyReceived(energy_wei);
    }

    await tx.wait();
    console.log("Operación completada satisfactoriamente");
}

main().catch((error) => {
    console.log(error);
    process.exitCode = 1;
});
