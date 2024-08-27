// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IVault.sol";
import "./Coin.sol";
import "./PriceConsumerV3.sol";
import "./MockOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Vault is IVault, Ownable {

    mapping (address => Vault) vaults;
    Stablecoin public token;
    PriceConsumerV3 private oracle;
    // using SafeMath for uint256;

    uint256 public constant interestRate = 5; // 5% per year
    mapping(address => uint256) public depositedAt;
    mapping(address => uint256) public interestAccumulated;

    constructor(string memory stablecoinName, string memory stablecoinSymbol, PriceConsumerV3 _oracle) Ownable(msg.sender) {
        token = new Stablecoin(stablecoinName, stablecoinSymbol);
        oracle = _oracle;
    }

    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function deposit() override payable external {
        uint256 amountToMint = msg.value * getEthUSDPrice();
        token.mint(msg.sender, amountToMint);
        // Calculate interest since the last deposit
        if (depositedAt[msg.sender] != 0) {
            uint256 timeElapsed = block.timestamp - depositedAt[msg.sender];
            uint256 interest = (vaults[msg.sender].debtAmount * interestRate * timeElapsed) / (365 days * 100);
            interestAccumulated[msg.sender] += interest;
        }

        depositedAt[msg.sender] = block.timestamp;

        vaults[msg.sender].collateralAmount += msg.value;
        vaults[msg.sender].debtAmount += amountToMint;
        emit Deposit(msg.value, amountToMint);
    }
    
    /**
    @notice Allows a user to withdraw up to 100% of the collateral they have on deposit
    @dev This cannot allow a user to withdraw more than they put in
    @param repaymentAmount  the amount of stablecoin that a user is repaying to redeem their collateral for.
     */
    function withdraw(uint256 repaymentAmount) override external {
        require(token.balanceOf(msg.sender) >= repaymentAmount, "not enough tokens in balance");
        
        // Calculate and accumulate interest
        if (depositedAt[msg.sender] != 0) {
            uint256 timeElapsed = block.timestamp - depositedAt[msg.sender];
            uint256 interest = (vaults[msg.sender].debtAmount * interestRate * timeElapsed) / (365 days * 100);
            interestAccumulated[msg.sender] += interest;
            depositedAt[msg.sender] = block.timestamp;
        }

        // Ensure the repaymentAmount covers the debt + interest
        uint256 totalDebtWithInterest = vaults[msg.sender].debtAmount + interestAccumulated[msg.sender];
        require(repaymentAmount <= totalDebtWithInterest, "withdraw limit exceeded");

        // Calculate the maximum amount of collateral that can be withdrawn
        uint256 amountToWithdraw = repaymentAmount / getEthUSDPrice();

        // Ensure the user cannot withdraw all the collateral if there's interest
        uint256 remainingCollateral = vaults[msg.sender].collateralAmount - amountToWithdraw;
        uint256 requiredCollateralForInterest = interestAccumulated[msg.sender] / getEthUSDPrice();
        
        // Ensure at least the required collateral to cover interest is left in the vault
        require(remainingCollateral >= requiredCollateralForInterest, "cannot withdraw all collateral with outstanding interest");

        // Burn the corresponding amount of tokens
        token.burn(msg.sender, repaymentAmount);

        // Update vault balances
        vaults[msg.sender].collateralAmount -= amountToWithdraw;
        vaults[msg.sender].debtAmount -= repaymentAmount;

        // Transfer the withdrawn amount of collateral back to the user
        payable(msg.sender).transfer(amountToWithdraw);

        emit Withdraw(amountToWithdraw, repaymentAmount);
    }

    /**
    @notice Returns the details of a vault
    @param userAddress  the address of the vault owner
    @return vault  the vault details
     */
    function getVault(address userAddress) external view override returns(Vault memory vault) {
        return vaults[userAddress];
    }
    
    /**
    @notice Returns an estimate of how much collateral could be withdrawn for a given amount of stablecoin
    @param repaymentAmount  the amount of stable coin that would be repaid
    @return collateralAmount the estimated amount of a vault's collateral that would be returned 
     */
    function estimateCollateralAmount(uint256 repaymentAmount) external view override  returns(uint256 collateralAmount) {
        return repaymentAmount / getEthUSDPrice();
    }
    
    /**
    @notice Returns an estimate on how much stable coin could be minted at the current rate
    @param depositAmount the amount of ETH that would be deposited
    @return tokenAmount  the estimated amount of stablecoin that would be minted
     */
    function estimateTokenAmount(uint256 depositAmount) external view override returns(uint256 tokenAmount) {
        return depositAmount * getEthUSDPrice();
    }

    function getEthUSDPrice() public view returns (uint256){
        uint price8 = uint(oracle.getLatestPrice());
        return price8; //*(10**10)
    }

    function getToken() external view returns (address){
        return address(token);
    }

    function setOracle(address _oracle) public onlyOwner {
        oracle = PriceConsumerV3(_oracle);
    }

    function getOracle() public view returns (address) {
        return address(oracle);
    }

    function getInterestRate() external pure returns (uint256) {
        return interestRate;
    }

    function getCurrentInterest(address user)
        external
        view
        returns (uint256)
    {
        uint256 timeElapsed = block.timestamp - depositedAt[user];
        uint256 interest = (vaults[user].debtAmount * interestRate * timeElapsed) / (365 days * 100);
        return interest;
    }

    function getDebt(address user) external view returns(uint256) {
        return vaults[user].debtAmount+interestAccumulated[msg.sender];
    }

    function getCollateralValue(address user) external view returns(uint256) {
        return vaults[user].collateralAmount;
    }

    function getDebtValue(address user) external view returns(uint256) {
        return vaults[user].debtAmount;
    }
}