// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

// Sepolia - ReputationRegistry - 0x8004B663056A597Dffe9eCcC1965A193B7388713

contract ReputationRegistryWrapper {

    IReputationRegistry public immutable core;

    constructor(address coreAddress) {
        core = IReputationRegistry(coreAddress);
    }

    struct AgentStats {
        int256 total;      // 6 decimals normalized
        uint256 count;
    }

    mapping(uint256 => AgentStats) public _agentStats;

    event WrappedFeedback(uint256 indexed agentId, address indexed user, AgentStats indexed agentReputation);

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
}