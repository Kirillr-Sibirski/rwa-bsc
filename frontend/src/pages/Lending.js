import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import ABI from '../contracts/Vault_ABI.json'

import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'

const vaultAddress = '0x451C61F95e2333CD68c7850eFAb4E3b3523BF91e';

const Lending = () => {
  const [borrowableValue, setBorrowableValue] = useState(0);
  const [collateralValue, setCollateralValue] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [interestRate, setInterestRate] = useState('underfined');
  const [debtValue, setDebtValue] = useState('underfined');
  const [collateralValueDeployed, setCollateralValueDeployed] = useState('underfined');
  const [borrowedAmount, setBorrowedAmount] = useState('underfined');

  useEffect( () => {
    pingStuff();
  }); // Empty dependency array ensures this effect runs only once (on mount)

    const pingStuff = async () => {
      if(walletAddress != '') {
        const provider = new ethers.providers.Web3Provider(walletAddress);
        const signer = provider.getSigner();
        const vault = new ethers.Contract(vaultAddress, ABI, signer);
        const tx = await vault.getInterestRate();
        setInterestRate(tx.toString());

        const ty = await vault.getDebt(await signer.getAddress());
        setDebtValue(ethers.utils.formatEther(ty));

        const ti = await vault.getCollateralValue(await signer.getAddress());
        setCollateralValueDeployed(ethers.utils.formatEther(ti));

        const tj = await vault.getDebtValue(await signer.getAddress());
        setBorrowedAmount(ethers.utils.formatEther(tj));
      }
    }

    const connectWallet = async () => {
        const injected = injectedModule()
        
        const onboard = Onboard({
          wallets: [injected],
          chains: [
            {
              id: '4201',
              token: 'ETH',
              label: 'Testnet',
              rpcUrl: ''
            },
          ]
        })
        
        const wallets = await onboard.connectWallet()
        
        console.log(wallets)
        
        if (wallets[0]) {
          setWalletAddress(wallets[0].provider);
        }
        else {
          console.error("Invalid wallet.")
        }
    };

    const handleDeposit = async (input) => {
      try {
        const provider = new ethers.providers.Web3Provider(walletAddress);
        const signer = provider.getSigner();
        const vault = new ethers.Contract(vaultAddress, ABI, signer);

        console.log(ethers.utils.parseUnits(input, "ether"));
        
        const tx = await vault.deposit(ethers.utils.parseUnits(input, "ether"), {value: ethers.utils.parseUnits(input, "ether"),  gasLimit: 3000000, gasPrice: ethers.utils.parseUnits('30', 'gwei')});
        await tx.wait();
    
        alert('Deposit successful!');
      } catch (error) {
        console.error('Error occurred:', error);
      }
    };

    const handleWithdraw = async (input) => {
      try {
        const provider = new ethers.providers.Web3Provider(walletAddress);
        const signer = provider.getSigner();
        const vault = new ethers.Contract(vaultAddress, ABI, signer);
        
        const tx = await vault.withdraw(ethers.utils.parseEther(input));
        await tx.wait();
    
        alert('Withraw successful!');
      } catch (error) {
        console.error('Error occurred:', error);
      }
    };

    const handleBorrowable = async (input) => { //estimateTokenAmount
      try {
        const provider = new ethers.providers.Web3Provider(walletAddress);
        const signer = provider.getSigner();
        const vault = new ethers.Contract(vaultAddress, ABI, signer);
        
        const tx = await vault.estimateTokenAmount(input);
        setBorrowableValue(tx.toString());
        console.log(tx.toString());
      } catch (error) {
        console.error('Error occurred:', error);
      }
    };

    const handleCollateral = async (input) => {
      try {
        const provider = new ethers.providers.Web3Provider(walletAddress);
        const signer = provider.getSigner();
        const vault = new ethers.Contract(vaultAddress, ABI, signer);
        
        const tx = await vault.estimateCollateralAmount(input);
        setCollateralValue(tx.toString());
        console.log(tx.toString());
      } catch (error) {
        console.error('Error occurred:', error);
      }
    };

    return (
      <div>
        <nav className="bg-[#FCFFFC] p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center flex-shrink-0 text-[#5A9367] mr-6">
                <Link to="/" className="font-semibold text-xl">
                  Sorrel Finance
                </Link>
            </div>
            <div className="block lg:hidden">
                <button
                className="flex items-center px-3 py-2 border rounded text-gray-300 border-gray-400 hover:text-[#FCFFFC] hover:border-[#FCFFFC]"
                onClick={() => {
                    // Add functionality for mobile menu toggle here
                    console.log('Mobile menu clicked');
                }}
                >
                <svg
                    className="h-3 w-3 fill-current"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <title>Menu</title>
                    <path
                    d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"
                    />
                </svg>
                </button>
            </div>
            <div className="hidden lg:block">
                <ul className="flex space-x-4">
                    <li>
                        <a
                            onClick={connectWallet}
                            className="block w-full py-2 px-4 text-black bg-[#90fcf9] rounded-md text-center transition duration-300 ease-in-out uppercase font-medium truncate hover:bg-[#FCFFFC] "
                        >
                            Connect Wallet
                        </a>
                    </li>
                </ul>
            </div>
          </div>
        </nav>
        <div className="bg-[#FCFFFC] h-screen flex items-center justify-center">
          <div className="max-w-7xl w-full px-4 flex">
            <div className="flex flex-col space-y-4">
              <button
                className="bg-[#90fcf9] hover:bg-[#FCFFFC] text-black font-bold py-2 px-4 rounded"
                onClick={() => handleDeposit(document.getElementById('depositAmount').value)}
              >
                Deposit
              </button>
              <input
                id="depositAmount"
                type="text"
                className="border-2 border-lightblue rounded px-3 py-1 focus:outline-none focus:border-blue-500"
                placeholder="Amount"
              />
              <button 
                className="bg-[#90fcf9] hover:bg-[#FCFFFC] text-black font-bold py-2 px-4 rounded"
                onClick={() => handleWithdraw(document.getElementById('withdrawAmount').value)}
              >
                Withdraw
              </button>
              <input
                id="withdrawAmount"
                type="text"
                className="border-2 border-lightblue rounded px-3 py-1 focus:outline-none focus:border-blue-500"
                placeholder="Amount of USD to deposit"
              />
            </div>
            <div className="ml-auto bg-blue-200 p-6 rounded" style={{ backgroundColor: '#2d3a3a' }}>
              <div className="text-[#FCFFFC]">
                <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
                <ul className="space-y-4">
                  <li className="flex items-center space-x-4">
                    <span className="text-[#FCFFFC]">Current interest rate:</span>
                    <span className="text-[#FCFFFC]">{interestRate}%</span>
                  </li>
                  <li className="flex items-center space-x-4">
                    <span className="text-[#FCFFFC]">Your debt:</span>
                    <span className="text-[#FCFFFC]">{debtValue} USD</span>
                  </li>

                  <li className="flex items-center space-x-4">
                    <span className="text-[#FCFFFC]">Collateral amount:</span>
                    <span className="text-[#FCFFFC]">{collateralValueDeployed} LYXt</span>
                  </li>
                  <li className="flex items-center space-x-4">
                    <span className="text-[#FCFFFC]">Borrowed:</span>
                    <span className="text-[#FCFFFC]">{borrowedAmount} USD</span>
                  </li>
                  {/* Borrowable amount */}
                  <li className="flex items-center space-x-4">
                    <button 
                      className="bg-[#90fcf9] hover:bg-[#FCFFFC] text-black font-bold py-2 px-4 rounded"
                      onClick={() => handleBorrowable(document.getElementById('borrowableAmount').value)}
                    >
                      Borrowable amount
                    </button>
                    <input
                      id="borrowableAmount"
                      type="text"
                      className="rounded px-3 py-1 focus:outline-none focus:border-blue-500 text-black"
                      placeholder="Collateral amount"
                    />
                    <span className="text-[#FCFFFC]">{borrowableValue} USD</span>
                  </li>
                  {/* Collateral amount */}
                  <li className="flex items-center space-x-4">
                    <button 
                      className="bg-[#90fcf9] hover:bg-[#FCFFFC] text-black font-bold py-2 px-4 rounded"
                      onClick={() => handleCollateral(document.getElementById('collateralAmount').value)}
                    >
                      Withdrawable collateral amount
                    </button>
                    <input
                      id="collateralAmount"
                      type="text"
                      className="rounded px-3 py-1 focus:outline-none focus:border-blue-500 text-black"
                      placeholder="Repayment amount"
                    />
                    <span className="text-[#FCFFFC]">{collateralValue} LYXt</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <footer className="bg-[#5A9367] text-[#FCFFFC] py-4 text-center">
          <div className="flex justify-center items-center">
              <p className="mr-2">Powered by EDU Chain.</p>
              <a
              href="https://twitter.com/kirillrybkov" // Replace with your Twitter profile URL
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-[#FCFFFC] hover:text-blue-400"
              >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 fill-current"
                  viewBox="0 0 24 24"
              >
                  <path
                  d="M23.891 4.579c-.828.368-1.716.616-2.646.733.951-.58 1.684-1.5 2.029-2.596-.894.534-1.885.922-2.945 1.13-.846-.902-2.052-1.467-3.393-1.467-2.565 0-4.647 2.082-4.647 4.646 0 .364.042.718.122 1.059-3.864-.194-7.288-2.045-9.579-4.868-.4.687-.631 1.488-.631 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.481-.234-2.106-.583v.058c0 2.259 1.605 4.137 3.737 4.567-.392.107-.805.163-1.229.163-.3 0-.593-.028-.879-.082.593 1.85 2.313 3.198 4.352 3.234-1.593 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.114-.065 2.062 1.323 4.505 2.092 7.14 2.092 8.568 0 13.255-7.098 13.255-13.254 0-.2-.004-.401-.012-.601.911-.658 1.7-1.479 2.324-2.418z"
                  />
              </svg>
              </a>
          </div>
          </footer>
      </div>
    );
};
 
export default Lending;