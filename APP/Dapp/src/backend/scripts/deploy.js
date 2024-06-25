const { ethers } = require("hardhat");
const { artifacts } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // First Load the StableCoin Contract
  const StableCoinContract = await ethers.getContractFactory("StableCoin");
  const stablecoin = await StableCoinContract.deploy();
  await stablecoin.deployed();
  saveFrontendFiles(stablecoin, "StableCoin");

  const SystemManagmentContract = await ethers.getContractFactory("SystemManagement");
  const systemManagment = await SystemManagmentContract.deploy(259200, "6318000000000000", stablecoin.address);
  await systemManagment.deployed();

  // Save copies of each contracts abi and address to the frontend.
  saveFrontendFiles(systemManagment, "SystemManagement");

  // read address of contracts deployed by system managment

  const tokenContractAddress = await systemManagment.tokenContractAddress();
  const tradingMarketContractAddress = await systemManagment.tradingMarketContractAddress();
  const tradingAuctionContractAddress = await systemManagment.tradingAcutionContractAddress();
  // load abis of compiled contracts
  const tokenContractAbi = await artifacts.readArtifact('TokenContract');
  const ETradingMarketAbi = await artifacts.readArtifact("ETradingMarket");
  const ETradingAcutionAbi = await artifacts.readArtifact("ETradingAcution");
  // load E trading Auction contract and extract address of AuctionManagment and offerManagment

  const eTradingAcutionContract = await ethers.getContractAt(ETradingAcutionAbi.abi, tradingAuctionContractAddress);

  const auctionManagmentAddress = await eTradingAcutionContract.acution_managment_contract();
  const offertAuctionManagmentAddress = await eTradingAcutionContract.offert_acution_contract();

  const auctionManagmentAbi = await artifacts.readArtifact('AcutionManagment');
  const offerAuctionAbi = await artifacts.readArtifact('OffertAcutionManagment');

  saveFrontendFiles({ address: tokenContractAddress, abi: tokenContractAbi.abi }, "TokenContract");
  saveFrontendFiles({ address: tradingMarketContractAddress, abi: ETradingMarketAbi.abi }, "ETradingMarket");
  saveFrontendFiles({ address: tradingAuctionContractAddress, abi: ETradingAcutionAbi.abi }, "ETradingAcution");
  saveFrontendFiles({ address: auctionManagmentAddress, abi: auctionManagmentAbi.abi }, "AcutionManagment");
  saveFrontendFiles({ address: offertAuctionManagmentAddress, abi: offerAuctionAbi.abi }, "OffertAcutionManagment");

}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });