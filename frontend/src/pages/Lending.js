import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import ABI from '../contracts/Vault_ABI.json';
import CustomAlert from './components/CustomAlert';

import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';

const vaultAddress = '0x59626CA6061A155961Fb5c378ec5373B54441692';

const Lending = () => {
  const [borrowableValue, setBorrowableValue] = useState(0);
  const [collateralValue, setCollateralValue] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [interestRate, setInterestRate] = useState('connect wallet');
  const [debtValue, setDebtValue] = useState('no loan');
  const [collateralValueDeployed, setCollateralValueDeployed] = useState('no loan');
  const [walletButtonText, setWalletButtonText] = useState('Connect Wallet');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    pingStuff();
  });

  const pingStuff = async () => {
    if (walletAddress !== '') {
      const provider = new ethers.providers.Web3Provider(walletAddress);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress(); // This is the correct way to get the address

      const vault = new ethers.Contract(vaultAddress, ABI, signer);

      const tx = await vault.getInterestRate();
      setInterestRate(tx.toString());

      const ty = await vault.getDebt(signerAddress);
      setDebtValue(ethers.utils.formatEther(ty));

      const ti = await vault.getCollateralValue(signerAddress);
      setCollateralValueDeployed(ethers.utils.formatEther(ti));
    }
  };

  const connectWallet = async () => {
    const injected = injectedModule();

    const onboard = Onboard({
      wallets: [injected],
      chains: [
        {
          id: '0xa01dc', // Correct hexadecimal for 656476
          token: 'EDU',
          label: 'EDU Chain',
          rpcUrl: 'https://rpc.open-campus-codex.gelato.digital/'
        },
      ]
    });

    const wallets = await onboard.connectWallet();

    if (wallets[0]) {
      setWalletAddress(wallets[0].provider);
      setWalletButtonText('Wallet Connected'); // Update the button text to "Wallet Connected"

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      const targetChainId = '0xa01dc'; // Correct hexadecimal string for chain ID 656476
    } else {
      console.error("Invalid wallet.");
    }
  };

  const handleDeposit = async (input) => {
    try {
      const provider = new ethers.providers.Web3Provider(walletAddress);
      const signer = provider.getSigner();
      const vault = new ethers.Contract(vaultAddress, ABI, signer);

      // Convert the input to the correct unit (Ether to Wei)
      console.log(input);
      const value = ethers.utils.parseUnits(input, 'ether')

      console.log("Value ", value);
      // Call the deposit function with the correct value parameter
      const tx = await vault.deposit({ value: value });

      // Wait for the transaction to be mined
      await tx.wait();

      setAlertMessage('Deposit sucessful!');
      pingStuff();
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };


  const handleWithdraw = async (input) => {
    try {
      const provider = new ethers.providers.Web3Provider(walletAddress);
      const signer = provider.getSigner();
      const vault = new ethers.Contract(vaultAddress, ABI, signer);

      // Get the current collateral and debt information
      const collateralAmount = await vault.getCollateralValue(await signer.getAddress());
      const debtAmount = await vault.getDebt(await signer.getAddress());
      const interest = await vault.getCurrentInterest(await signer.getAddress());

      // Convert inputs to BigNumber for comparison
      const repaymentAmount = ethers.utils.parseEther(input);
      const totalDebtWithInterest = debtAmount.add(interest);
      const collateralAmountBigNumber = ethers.BigNumber.from(collateralAmount);

      // Calculate the amount of collateral that would be withdrawn
      const amountToWithdraw = repaymentAmount.div(await vault.getEthUSDPrice());

      // Check if the remaining collateral is enough to cover the interest
      const remainingCollateral = collateralAmountBigNumber.sub(amountToWithdraw);
      const requiredCollateralForInterest = interest.div(await vault.getEthUSDPrice());

      if (remainingCollateral.lt(requiredCollateralForInterest)) {
        setAlertMessage('You cannot withdraw all of the collateral because you have accumulated interest that needs to be paid.');
        return;
      }

      const tx = await vault.withdraw(repaymentAmount);
      await tx.wait();

      setAlertMessage('Withdraw successful!');
      pingStuff();
    } catch (error) {
      console.error('Error occurred:', error);
      setAlertMessage('An error occurred during the withdrawal. Please try again.');
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
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
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
                  {walletButtonText} {/* Updated to use dynamic text */}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="bg-[#FCFFFC] h-screen flex items-center justify-center">
        <div className="max-w-7xl w-full px-4 flex space-x-8">
          <div className="flex flex-col space-y-4 w-1/3">
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
              placeholder="Amount in EDU"
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
              placeholder="Amount in USDS"
            />
          </div>

          <div className="w-2/3 bg-[#2d3a3a] p-6 rounded-lg text-[#FCFFFC]">
            <h2 className="text-2xl font-semibold mb-6">Your Loan Overview</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Interest Rate</h3>
                <p className="text-xl">{interestRate}%</p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Total Debt Left to Repay</h3>
                <p className="text-xl">{debtValue} USDS</p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Collateral Amount</h3>
                <p className="text-xl">{collateralValueDeployed} EDU</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-semibold mb-6">Calculate Potential Actions</h2>

              <div className="flex space-x-4">
                <input
                  id="borrowableAmount"
                  type="text"
                  className="rounded px-3 py-1 focus:outline-none focus:border-blue-500 text-black w-1/2"
                  placeholder="Collateral amount in EDU"
                />
                <button
                  className="bg-[#90fcf9] hover:bg-[#FCFFFC] text-black font-bold py-2 px-4 rounded"
                  onClick={() => handleBorrowable(document.getElementById('borrowableAmount').value)}
                >
                  Calculate Borrowable Amount
                </button>
              </div>
              <p className="text-xl">{borrowableValue} USDS</p>

              <div className="flex space-x-4 mt-4">
                <input
                  id="collateralAmount"
                  type="text"
                  className="rounded px-3 py-1 focus:outline-none focus:border-blue-500 text-black w-1/2"
                  placeholder="Repayment amount in USDS"
                />
                <button
                  className="bg-[#90fcf9] hover:bg-[#FCFFFC] text-black font-bold py-2 px-4 rounded"
                  onClick={() => handleCollateral(document.getElementById('collateralAmount').value)}
                >
                  Calculate Withdrawable Collateral
                </button>
              </div>
              <p className="text-xl">{collateralValue} EDU</p>
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
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage('')}
        />
      )}
    </div>
  );
};

export default Lending;
