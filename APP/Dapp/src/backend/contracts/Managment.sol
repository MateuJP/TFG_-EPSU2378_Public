// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.2;

import "./TokenERC20.sol";
import "./ETradingMarket.sol";
import "./ETradingAcution.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StableCoin.sol";

/**
 * @title Management Contract for Energy Trading Platform
 * @dev This smart contract is designed for system administration tasks such as managing users,
 * smart meters. It owns the market and acution trading system contracts that contains all the logic
 * for energy requests, energy sale offers, and establishing contracts between consumers and providers.
 */
contract SystemManagement is Ownable {
    // Contract instances and addresses
    address public tokenContractAddress; // Address of the deployed TokenContract
    TokenContract public tokenContract; // Instance of TokenContract for interaction
    address public tradingMarketContractAddress;
    address public tradingAcutionContractAddress;
    ETradingMarket public tradingMarketContract;
    ETradingAcution public tradingAcutionContract;
    StableCoin public stableCoin;

    // Events for logging actions
    event TokensMinted(uint256 amount);
    event UserRegistered(address indexed newUser, string role);
    event RoleRevoked(string role, address indexed user);

    /**
     * @dev Constructor that deploys a new TokenContract and initializes trading contracts.
     * @param initialDelay Initial delay for change the Role administrator of the contracts
     * @param minKwhPrice Minimum kWh price for trading contracts
     * @param token_address_stableCoin Address of the stable Coin Contract
     */
    constructor(
        uint48 initialDelay,
        uint64 minKwhPrice,
        address token_address_stableCoin
    ) {
        tokenContractAddress = address(
            new TokenContract(token_address_stableCoin)
        );
        tokenContract = TokenContract(tokenContractAddress);
        tradingMarketContractAddress = address(
            new ETradingMarket(initialDelay, minKwhPrice, tokenContractAddress)
        );
        tradingMarketContract = ETradingMarket(tradingMarketContractAddress);
        tradingMarketContract.grantRole(keccak256("ADMIN_ROLE"), address(this));
        tradingAcutionContractAddress = address(
            new ETradingAcution(initialDelay, minKwhPrice, tokenContractAddress)
        );
        tradingAcutionContract = ETradingAcution(tradingAcutionContractAddress);
        tradingAcutionContract.grantRole(
            keccak256("ADMIN_ROLE"),
            address(this)
        );
        stableCoin = StableCoin(token_address_stableCoin);
    }

    /**
     * @dev Function to mint new tokens, restricted to the owner.
     * @param amount The amount of tokens to be minted.
     */
    function mintNewTokens(uint256 amount) public onlyOwner {
        tokenContract.mint(amount);
        emit TokensMinted(amount);
    }

    /**
     * @dev Allows the owner to retrieve MATIC from the TokenContract.
     */
    function withdrawMatic() public onlyOwner {
        tokenContract.retrieveStableTokens();
        stableCoin.transfer(msg.sender, stableCoin.balanceOf(address(this)));
    }

    /**
     * @dev Allows the owner to change the admin role of the contracts tradingAuction and market.
     * @param _newAdmin New admin address
     */
    function changeAdminRole(address _newAdmin) public onlyOwner {
        tradingAcutionContract.beginDefaultAdminTransfer(_newAdmin);
        tradingMarketContract.beginDefaultAdminTransfer(_newAdmin);
    }

    /**
     * @dev Registers a new user with a specific role in the platform.
     * @param role The role assigned to the new user.
     */
    function registerUser(string memory role) public {
        bytes memory roleBytes = bytes(role);
        tradingMarketContract.grantRole(keccak256(roleBytes), msg.sender);
        tradingAcutionContract.grantRole(keccak256(roleBytes), msg.sender);
        emit UserRegistered(msg.sender, role);
    }

    /**
     * @dev Allows a user to deregister from the platform and revoke their roles.
     * @param role The role to be revoked from the calling user.
     */
    function deregisterFromPlatform(string memory role) public {
        bytes memory roleBytes = bytes(role);
        tradingMarketContract.revokeRole(keccak256(roleBytes), msg.sender);
        tradingAcutionContract.revokeRole(keccak256(roleBytes), msg.sender);
    }

    /**
     * @dev Revokes a specific role from a user, restricted to the owner.
     * @param role The role to be revoked.
     * @param user The address of the user from whom the role is being revoked.
     */
    function removeUserRole(string memory role, address user) public onlyOwner {
        bytes memory roleBytes = bytes(role);
        tradingMarketContract.revokeRole(keccak256(roleBytes), user);
        tradingAcutionContract.revokeRole(keccak256(roleBytes), user);
        emit RoleRevoked(role, user);
    }
}
