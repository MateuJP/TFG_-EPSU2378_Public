// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;

// Importing OpenZeppelin contracts for ERC20 token implementation, ownership management, and reentrancy protection
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract StableCoin is ERC20, ReentrancyGuard {
    // Indicate that 1 Eur token is like 0,00030 Ether
    address public owner;
    uint256 public immutable price_token_ether = 300000000000000;

    constructor() ERC20("StableCoin Euro", "Eur") {
        _mint(address(this), 100_000_000 * 10 ** 18);
        owner = msg.sender;
    }

    // Modifier to restrict certain functions to the contract owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "You cannot execute this function");
        _;
    }

    /**
     * @dev Allows users to purchase tokens from the contract in exchange for eth,matic etc.
     * @param amount Number of tokens the user wishes to buy in wei
     */
    function buyStableTokens(uint256 amount) public payable nonReentrant {
        require(
            _balanceContract() >= amount,
            "Contract doesn't have enought Eur Tokens"
        );
        uint256 total_price = (amount * price_token_ether) / 10 ** 18;
        require(
            msg.value >= total_price,
            "Money you are Sending is not enought"
        );
        // send stable coins to the user
        _transfer(address(this), msg.sender, amount);
        uint256 return_value = msg.value - total_price;
        if (return_value > 0) {
            payable(msg.sender).transfer(return_value);
        }
    }

    /**
     * @dev Allows users to return tokens to the contract in exchange for MATIC,eth etc, based on the current token price.
     * @param amount Number of tokens the user wishes to return, denominated in the smallest token unit
     */
    function returnTokens(uint256 amount) public payable nonReentrant {
        require(
            balanceOf(msg.sender) >= amount,
            "You don't have enough tokens"
        );
        uint256 total_return = (amount * price_token_ether) / 10 ** 18;
        require(
            _balanceCurrencyContract() >= total_return,
            "Smart contract doesn't have enough MATIC"
        );
        // Transferring tokens from the user back to the contract
        _transfer(msg.sender, address(this), amount);
        // Sending the corresponding amount of MATIC to the user
        payable(msg.sender).transfer(total_return);
    }

    /**
     * @dev Allows the owner to withdraw excess MATIC from the contract, ensuring enough MATIC remains to cover all circulating tokens.
     */
    function retrieveCurrency() external onlyOwner nonReentrant {
        uint256 total_balance = address(this).balance;
        // Calculating the amount of Currency required to cover all circulating tokens
        uint256 matic_for_users = (circulationTokens() * price_token_ether) /
            10 ** 18;
        // Determining the excess MATIC available for withdrawal
        uint256 excess_matic = total_balance - matic_for_users;
        require(excess_matic > 0, "There's not enough MATIC");
        payable(owner).transfer(excess_matic);
    }

    /**
     * @dev Public view function to get the number of tokens in circulation.
     */
    function circulationTokens() public view returns (uint256) {
        return totalSupply() - balanceOf(address(this));
    }

    /**
     * @dev Mints new tokens, increasing the total supply and contract's balance.
     * @param amount Number of tokens to mint, denominated in the smallest token unit
     */
    function mint(uint256 amount) external onlyOwner nonReentrant {
        _mint(address(this), amount);
    }

    /**
     * @dev Returns the token balance of the contract.
     */
    function _balanceContract() internal view returns (uint256) {
        return balanceOf(address(this));
    }

    /**
     * @dev Returns the Currency balance of the contract.
     */
    function _balanceCurrencyContract() internal view returns (uint256) {
        return address(this).balance;
    }
}
