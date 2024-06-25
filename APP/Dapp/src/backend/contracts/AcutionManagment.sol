// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AuctionManagement Contract
 * @dev Manages auctions for energy supply requests, including creation and retrieval of requests
 */

contract AcutionManagment is Ownable, ReentrancyGuard {
    // Struct for consumer requests
    struct Request {
        uint index;
        uint256 id_request;
        address consumer;
        uint64 max_price_kwh;
        uint32 energy_amount;
        uint32 limit_time;
    }
    // Array to store all consumer requests
    Request[] public request_acutions;
    mapping(uint256 => uint) private id_index;
    event NewRequest(address indexed consumer, uint256 id_request);

    constructor() {}

    /**
     * @dev Retrieves all active auction requests
     * @return Request[] Array of all active requests
     */
    function getAllRequest() public view returns (Request[] memory) {
        return request_acutions;
    }

    /**
     * @dev Returns details of a specific request by its ID.
     * @param id_request The ID of the request to retrieve
     * @return consumer The address of the consumer who made the request
     * @return max_price_kwh The maximum price per kWh the consumer is willing to pay
     * @return energy_amount The amount of energy requested
     * @return limit_time The time until which the request is valid
     */
    function getRequest(
        uint256 id_request
    ) public nonReentrant returns (address, uint64, uint32, uint32) {
        uint index = id_index[id_request];
        return (
            request_acutions[index].consumer,
            request_acutions[index].max_price_kwh,
            request_acutions[index].energy_amount,
            request_acutions[index].limit_time
        );
    }

    /**
     * @dev Allows consumers to send energy supply requests. Only the contract ETradingAuction can execute this function
     * @param _consumer The address of the consumer making the request
     * @param max_price_kwh The maximum price per kWh the consumer is willing to pay
     * @param request_amount The amount of energy requested
     * @param limit_time The duration (in seconds) for which the request is valid
     */
    function sendRequest(
        address _consumer,
        uint256 id_request,
        uint64 max_price_kwh,
        uint32 request_amount,
        uint limit_time
    ) external onlyOwner nonReentrant {
        Request memory request = Request({
            index: request_acutions.length,
            id_request: id_request,
            consumer: _consumer,
            max_price_kwh: max_price_kwh,
            energy_amount: request_amount,
            limit_time: uint32(block.timestamp + limit_time * 60)
        });
        request_acutions.push(request);
        id_index[id_request] = request.index;
        emit NewRequest(_consumer, request.id_request);
    }

    /**
     * @dev Delete a request before the acution is closed
     * @param id_request ID of the request
     * @param consumer Address of the consumer that wants to retrive the offer before the acution is closed
     */

    function deleteRequest(
        uint is_system,
        uint256 id_request,
        address consumer
    ) external onlyOwner {
        uint index = id_index[id_request];
        require(index < request_acutions.length, "Invalid offer ID");
        if (is_system == 0) {
            require(
                consumer == request_acutions[index].consumer,
                "Not Allowed"
            );
        }
        require(
            block.timestamp < request_acutions[index].limit_time,
            "Not Allowed"
        );
        request_acutions[index] = request_acutions[request_acutions.length - 1];
        request_acutions[index].index = index;
        id_index[request_acutions[index].id_request] = index;
        request_acutions.pop();
    }
}
