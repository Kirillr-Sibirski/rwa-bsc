// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {Script, console} from "forge-std/Script.sol";
import {Stablecoin} from "../src/implementation/Coin.sol";
import {PriceConsumerV3} from "../src/implementation/PriceConsumerV3.sol";
import {MockOracle} from "../src/implementation/MockOracle.sol";
import {Vault} from "../src/implementation/Vault.sol";

contract DeployContracts is Script {
    function run() external {
        address deployer = tx.origin;

        console.log("Address: ", deployer);
        console.log("balance: ", deployer.balance);

        vm.startBroadcast(deployer);
        MockOracle mockOracle = new MockOracle();
        // PriceConsumerV3 priceConsumer = new PriceConsumerV3();
        // Stablecoin stablecoin = new Stablecoin("USD Sorrel", "USDS");
        // Vault vault = new Vault(stablecoin, priceConsumer);

        vm.stopBroadcast();

        console.log("MockOracle deployed at:", address(mockOracle));
        // console.log("PriceConsumerV3 deployed at:", address(priceConsumer));
        // console.log("Stablecoin deployed at:", address(stablecoin));
        // console.log("Vault deployed at:", address(vault));
    }
}
