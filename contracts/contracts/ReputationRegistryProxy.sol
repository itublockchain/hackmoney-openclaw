// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

interface IReputationRegistry {
    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external;

    function readFeedback(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex
    ) external view returns (int128, uint8, string memory, string memory, bool);

    function getLastIndex(uint256 agentId, address clientAddress) external view returns (uint64);
}

contract ReputationRegistryWrapper is Initializable, OwnableUpgradeable, UUPSUpgradeable {

    IReputationRegistry public core;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner, address coreAddress) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        core = IReputationRegistry(coreAddress);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    struct AgentStats {
        int256 total;
        uint256 count;
    }

    mapping(uint256 => AgentStats) public _agentStats;

    event WrappedFeedback(uint256 agentId, address user, AgentStats agentReputation);

    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external {
        require(valueDecimals <= 6, "Value decimals must be maximum 6");

        core.giveFeedback(
            agentId,
            value,
            valueDecimals,
            tag1,
            tag2,
            endpoint,
            feedbackURI,
            feedbackHash
        );

        int256 normalized = int256(value) * int256(10 ** (6 - valueDecimals));

        AgentStats storage s = _agentStats[agentId];
        s.total += normalized;
        s.count++;

        emit WrappedFeedback(agentId, msg.sender, _agentStats[agentId]);
    }

    function readAgentStat(uint256 agentId) public view returns(AgentStats memory){
        return _agentStats[agentId];
    }

    function readFeedback(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex
    ) external view returns (int128, uint8, string memory, string memory, bool) {
        return core.readFeedback(agentId, clientAddress, feedbackIndex);
    }

    function getLastIndex(uint256 agentId, address clientAddress) external view returns (uint64) {
        return core.getLastIndex(agentId, clientAddress);
    }

    uint256[50] private __gap;
}