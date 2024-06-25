import React, { useEffect, useState } from 'react';
import 'bootstrap';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Swal from 'sweetalert2';
import Login from './LoginRegister/login.js';
import Register from './LoginRegister/register.js';
import NavPrincipal from './LoginRegister/navPrincipal.js';
import StartScreen from './admin_start';
import Admin from './admin';
import AddSmartMeter from './SmartMeter/Add.js';
import RemoveSmartMeter from './SmartMeter/Remove';
import EditSmartMeter from './SmartMeter/Edit.js';
import AccountManagment from './accountManagment';
import OfferSend from './Offers/offerSend.js';
import RevealOffer from './Offers/revealOffer.js';
import OfferConsumerManager from './Offers/OfferConsumerManager.js';
import SETViewComponent from './Tokens/SET/ViewComponent.js';
import GTTViewComponent from './Tokens/GTT/ViewComponent.js';
import AllAgreements from './Agreement/AllAgreements.js';
import AgreementViewComponent from './Agreement/ViewComponent.js';
import '../../assets/styles/app.css'
import { Web3Provider } from './web3Context';
import { ethers } from 'ethers';
import ManageOffers from './Offers/ManageActiveOffers.js';
function handleError(mensaje) {
  Swal.fire({
    icon: "error",
    width: 800,
    padding: "3rem",
    text: `${mensaje}`,
    backdrop: "rgba(255,38,68,0.2) left top",
  });
}

function handleSucces(mensaje) {
  Swal.fire({
    icon: "success",
    width: 800,
    padding: "3rem",
    text: `${mensaje}`,
    backdrop: "rgba(55,238,68,0.2) left top",
  });
}
function parseWei(value) {
  return ethers.utils.parseEther(value.toString(), 18).toString();
}
function parseEther(value) {
  return ethers.utils.formatEther(value);

}

function App() {
  const URI = 'http://localhost:8000/';


  useEffect(() => {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    if (!isChrome) {
      alert('Esta DApp está diseñada para funcionar en Google Chrome. Algunas características pueden no ser compatibles en otros navegadores.');
    }
  }, [])
  return (
    <BrowserRouter>

      <Web3Provider>
        <Routes>
          <Route path='/' element={<LoginComponent URI={URI} />} />
          <Route path='/register' element={<RegisterComponent URI={URI} />} />
          <Route path='/panelControl' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<Admin />} />} />
          <Route path='/settingsAccount' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<AccountManagment URI={URI} functionSuccess={handleSucces} funcionError={handleError} />} />} />

          <Route path='/smartMeters/add' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<AddSmartMeter URI={URI} functionSuccess={handleSucces} funcionError={handleError} />} />} />

          <Route path='/smartMeters/remove' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<RemoveSmartMeter URI={URI} functionSuccess={handleSucces} funcionError={handleError} />} />} />
          <Route path='/smartMeters/edit' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<EditSmartMeter URI={URI} functionSuccess={handleSucces} funcionError={handleError} />} />} />

          <Route path='/offers/send' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<OfferSend URI={URI} functionSuccess={handleSucces} functionError={handleError} />} />} />
          <Route path='/offers/reveal' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<RevealOffer URI={URI} functionSuccess={handleSucces} functionError={handleError} />} />} />
          <Route path='/offers/manage' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<ManageOffers URI={URI} functionSuccess={handleSucces} functionError={handleError} />} />} />
          <Route path='/viewMarketOffers' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<OfferConsumerManager URI={URI} functionSuccess={handleSucces} functionError={handleError} />} />} />

          <Route path='/tokens/set' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<SETViewComponent URI={URI} functionSuccess={handleSucces} functionError={handleError} parseWei={parseWei} parseEther={parseEther} />} />} />

          <Route path='/tokens/gtt' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<GTTViewComponent URI={URI} functionSuccess={handleSucces} functionError={handleError} parseWei={parseWei} parseEther={parseEther} />} />} />

          <Route path='/agreement/viewAll/' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<AllAgreements URI={URI} />} />} />


          <Route path='/agreement/details/:contractAddress' element={<StartScreen URI={URI} functionError={handleError} functionSuccess={handleSucces}
            children={<AgreementViewComponent URI={URI} functionSuccess={handleSucces} functionError={handleError} parseWei={parseWei} parseEther={parseEther} />} />} />


        </Routes>

      </Web3Provider>
    </BrowserRouter>


  );
}

const LoginComponent = ({ URI }) => (
  <>
    <div id="page" className="s-pagewrap ss-home">
      <NavPrincipal />
    </div>
    <Login URI={URI} functionSuccess={handleSucces} funcionError={handleError} />
  </>
);

// Acepta web3Handler y account como props
const RegisterComponent = ({ URI, web3Handler, account, sysManagementContract, signer }) => (
  <>
    <div id="page" className="s-pagewrap ss-home">
      <NavPrincipal />
    </div>
    <Register URI={URI} functionSuccess={handleSucces} functionError={handleError} web3Handler={web3Handler} account={account} systemManagmentContract={sysManagementContract}
      signer={signer} />
  </>
);

export default App;
