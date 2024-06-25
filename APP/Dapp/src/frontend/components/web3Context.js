import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import stableCoinAbi from '../contractsData/StableCoin.json';
import stableCoinAddress from '../contractsData/StableCoin-address.json';
import tokenAbi from '../contractsData/TokenContract.json';
import tokenAddress from '../contractsData/TokenContract-address.json';
import etradingMarketAbi from '../contractsData/ETradingMarket.json';
import etradingMarketAddress from '../contractsData/ETradingMarket-address.json';
import systemManagementAbi from '../contractsData/SystemManagement.json';
import systemManagementAddress from '../contractsData/SystemManagement-address.json';
import modelAgreementAbi from '../contractsData/ModelAgreement.json'
import { useLocation } from 'react-router-dom';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [signer, setSigner] = useState(null);
    const location = useLocation();


    const web3Handler = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
            localStorage.setItem('wallet', accounts[0]);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            setSigner(signer);


            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });

            window.ethereum.on('accountsChanged', async function (accounts) {
                setAccount(accounts[0]);
                await web3Handler();
            });
        } catch (error) {
            console.log("Error in web3Handler", error)
        }
    };


    useEffect(() => {
        if (localStorage.getItem('wallet') && (window.location.pathname !== '/register' && window.location.pathname !== '/')) {
            setAccount(localStorage.getItem('wallet'));

        } else if (window.location.pathname !== '/register' && window.location.pathname !== '/') {
            invokeWeb3Handler();
        }
    }, [location.pathname]);


    // Para evitar perder el estado si el usuario decide recargar la página
    useEffect(() => {
        web3Handler();
    }, []);

    const invokeWeb3Handler = async () => {
        await web3Handler();

    }
    return (
        <Web3Context.Provider value={{ web3Handler, account, tokenAddress, tokenAbi, etradingMarketAddress, etradingMarketAbi, systemManagementAddress, systemManagementAbi, tokenAddress, tokenAbi, stableCoinAddress, stableCoinAbi, modelAgreementAbi, signer }}>
            {children}
        </Web3Context.Provider>
    );
};
