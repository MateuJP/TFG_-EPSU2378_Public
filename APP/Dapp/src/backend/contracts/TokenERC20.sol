// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

// Importing OpenZeppelin contracts for ERC20 token implementation, ownership management, and reentrancy protection
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./StableCoin.sol";

/**
 * @title TokenContract
 * @dev Manages the ERC20 tokens for an energy trading system, including token purchase and return functionalities.
 */
contract TokenContract is ERC20, ReentrancyGuard {
    // 1GTT = 1 Stable Coin €
    uint256 public immutable token_price = 1000000000000000000;

    // Contract owner's address
    address internal owner;

    // Satable Coin contract address
    address public stable_token_address;

    StableCoin stableCoin;

    // Events for logging token purchase and return transactions
    event PurchaseToken(address indexed buyer, uint256 amount);
    event ReturnToken(address indexed user, uint256 amount);

    // Modifier to restrict certain functions to the contract owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "You cannot execute this function");
        _;
    }

    /**
     * @dev Sets up the ERC20 token with a specified price and initial supply.
     */
    constructor(
        address token_contract_stable
    ) ERC20("Green Trading Token", "GTT") {
        // Minting 1 million tokens to the contract itself
        _mint(address(this), 1_000_000 * 10 ** 18);
        owner = msg.sender;
        stable_token_address = token_contract_stable;
        stableCoin = StableCoin(stable_token_address);
        // Emitting a transfer event from the zero address to the contract to represent minting
        emit Transfer(address(0), address(this), totalSupply());
    }

    /**
     * @dev Allows users to purchase tokens from the contract in exchange for stable coins.
     * @param amount Number of tokens the user wishes to buy, denominated in the smallest token unit
     */
    function buyTokens(uint256 amount) public nonReentrant {
        require(
            _balanceContract() >= amount,
            "Shop doesn't have enough tokens"
        );
        // Calculating the total cost of the requested tokens
        uint256 total_price = (amount * token_price) / 10 ** 18;
        require(
            stableCoin.allowance(msg.sender, address(this)) >= total_price,
            "Money you are sending is not enough"
        );
        // Transfer stable tokens to the contract
        stableCoin.transferFrom(msg.sender, address(this), amount);
        // Send GTT tokens to he user
        _transfer(address(this), msg.sender, amount);
        emit PurchaseToken(msg.sender, amount);
    }

    /**
     * @dev Allows users to return tokens to the contract in exchange for Stable Coin tokens.
     * @param amount Number of tokens the user wishes to return, denominated in the smallest token unit
     */
    function returnTokens(uint256 amount) public nonReentrant {
        require(
            balanceOf(msg.sender) >= amount,
            "You don't have enough tokens"
        );
        uint256 total_return = (amount * token_price) / 10 ** 18;
        require(
            _balanceStableTokensContract() >= total_return,
            "Smart contract doesn't have enough Stable Tokens"
        );
        // Transferring tokens from the user back to the contract
        _transfer(msg.sender, address(this), amount);
        // Sending the corresponding amount of Stable Tokens to the user
        stableCoin.transfer(msg.sender, total_return);
        emit ReturnToken(msg.sender, amount);
    }

    /**
     * @dev Transfers contract ownership to a new address.
     * @param _newOwner Address of the new owner
     */
    function changeOwner(address _newOwner) external onlyOwner nonReentrant {
        owner = _newOwner;
    }

    /**
     * @dev Allows the owner to withdraw excess MATIC from the contract, ensuring enough stablecoins remains to cover all circulating tokens.
     */
    function retrieveStableTokens() external onlyOwner nonReentrant {
        uint256 total_balance = stableCoin.balanceOf(address(this));
        // Calculating the amount of stablecoins required to cover all circulating tokens
        uint256 matic_for_users = (circulationTokens() * token_price) /
            10 ** 18;
        // Determining the excess stablecoins available for withdrawal
        uint256 excess_stableCoin = total_balance - matic_for_users;
        require(excess_stableCoin > 0, "There's not enough MATIC");
        stableCoin.transfer(owner, excess_stableCoin);
    }

    /**
     * @dev Mints new tokens, increasing the total supply and contract's balance.
     * @param amount Number of tokens to mint, denominated in the smallest token unit
     */
    function mint(uint256 amount) external onlyOwner nonReentrant {
        _mint(address(this), amount);
    }

    // Private helper functions

    /**
     * @dev Returns the token balance of the contract.
     */
    function _balanceContract() internal view returns (uint256) {
        return balanceOf(address(this));
    }

    /**
     * @dev Returns the Stable Coind balance of the contract.
     */
    function _balanceStableTokensContract() internal view returns (uint256) {
        return stableCoin.balanceOf(address(this));
    }

    /**
     * @dev Public view function to get the number of tokens in circulation.
     */
    function circulationTokens() public view returns (uint256) {
        return totalSupply() - balanceOf(address(this));
    }
}
