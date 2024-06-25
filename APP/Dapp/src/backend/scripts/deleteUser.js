const { ethers } = require("hardhat");
const { artifacts } = require("hardhat");
const systemManagmentAddress = require('../../frontend/contractsData/SystemManagement-address.json');
async function main(role, wallet) {
    const [owner] = await ethers.getSigners();

    const SystemManagmentContract = await ethers.getContractFactory('SystemManagement');
    const contract = SystemManagmentContract.attach(systemManagmentAddress.address);

    const tx = await contract.removeUserRole(role, wallet)

    await tx.wait();
    console.log("Ususario eliminado")
}

main("CONSUMER_ROLE", '0xB56B14D2C68a3c47A9b81Bc681f554bc4Ba1A8E9')
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    })