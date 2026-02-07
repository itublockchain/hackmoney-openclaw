// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract L2SubdomainRegistry is Ownable {
    mapping(bytes32 => address) public domains;
    
    event SubdomainRegistered(bytes32 indexed labelHash, string label, address indexed owner);

    constructor() Ownable(msg.sender) {}

    function register(string memory label, address owner) external onlyOwner {
        bytes32 labelHash = keccak256(bytes(label));
        require(domains[labelHash] == address(0), "L2SubdomainRegistry: Name already taken");
        domains[labelHash] = owner;
        emit SubdomainRegistered(labelHash, label, owner);
    }

    function available(string memory label) external view returns (bool) {
        bytes32 labelHash = keccak256(bytes(label));
        return domains[labelHash] == address(0);
    }
}
