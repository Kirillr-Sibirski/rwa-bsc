// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {Script, console} from "forge-std/Script.sol";
import {Stablecoin} from "../src/implementation/Coin.sol";
import {PriceConsumerV3} from "../src/implementation/PriceConsumerV3.sol";
import {MockOracle} from "../src/implementation/MockOracle.sol";
import {Vault} from "../src/implementation/Vault.sol";

contract DeployContracts is Script {
    function run() external {
        // This deployer account will be used to deploy the contracts
        address deployer = makeAddr("Deployer");

        // Start broadcasting transactions
        vm.startBroadcast(deployer);

        // Deploy the MockOracle contract
        MockOracle mockOracle = new MockOracle();

        // Deploy the PriceConsumerV3 contract
        PriceConsumerV3 priceConsumer = new PriceConsumerV3();

        // Deploy the Stablecoin contract
        Stablecoin stablecoin = new Stablecoin("EDUCOIN", "EDU");

        // Deploy the Vault contract
        Vault vault = new Vault(stablecoin, priceConsumer);

        // Optionally, set the Oracle to the mock oracle if needed
        vault.setOracle(address(mockOracle));

        // Stop broadcasting transactions
        vm.stopBroadcast();

        // Logging the deployed contract addresses
        console.log("MockOracle deployed at:", address(mockOracle));
        console.log("PriceConsumerV3 deployed at:", address(priceConsumer));
        console.log("Stablecoin deployed at:", address(stablecoin));
        console.log("Vault deployed at:", address(vault));
    }
}
