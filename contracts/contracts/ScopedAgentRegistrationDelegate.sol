// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

interface IAgentRegistry {
    function register(string memory agentURI) external returns (uint256 agentId);
}

interface IEntryPoint {
    function depositTo(address account) external payable;
}

struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}

contract Scoped7702AgentAccount {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // v0.6: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
    // v0.7: 0x0000000071727De22E5E9d8BAf0edAc6f37da032
    address public immutable ENTRY_POINT = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;
    address public immutable TARGET_REGISTRY = 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432;

    error InvalidTarget();
    error NotEntryPoint();
    error InvalidSignature();
    error ExecutionFailed();

    constructor() {
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData) {
        if (msg.sender != ENTRY_POINT) revert NotEntryPoint();

        bytes32 hash = userOpHash.toEthSignedMessageHash();
        address signer = hash.recover(userOp.signature);

        if (signer != address(this)) {
            return 1; // SIG_VALIDATION_FAILED
        }

        if (missingAccountFunds > 0) {
            (bool success, ) = ENTRY_POINT.call{value: missingAccountFunds}("");
            require(success, "Gas prefund failed");
        }

        return 0;
    }

    function executeRegister(
        string memory agentURI
    ) external returns (uint256 agentId) {
        
        // if (msg.sender != ENTRY_POINT) revert NotEntryPoint();

        try IAgentRegistry(TARGET_REGISTRY).register(agentURI) returns (uint256 id) {
            return id;
        } catch (bytes memory reason) {
            
            assembly {
                revert(add(reason, 32), mload(reason))
            }
        }
    }
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    receive() external payable {}
}