// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

interface IIdentityRegistry {
    function getAgentIdByWallet(address wallet) external view returns (uint256);
}

interface IReputationRegistryWrapper {
    function getAverageReputation(uint256 agentId) external view returns (int256);
}

contract EscrowX402 is Initializable, PausableUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
    struct Escrow {
        address depositor;
        address worker;
        uint256 amount;
        bool released;
    }

    mapping(string => Escrow) public escrows;
    mapping(address => bool) public WhitelistedAgents;

    IIdentityRegistry public identityRegistry;
    IReputationRegistryWrapper public reputationRegistry;

    uint256 public releaseFeeBps; // basis points: 100 = 1%, max 10000 = 100%

    event Deposited(string jobId, address depositor, address worker, uint256 amount);
    event Released(string jobId, address worker, uint256 amount);
    event ReleaseFeeUpdated(uint256 feeBps);
    event RegistriesUpdated(address identityRegistry, address reputationRegistry);
    event AgentWhitelistChange(address agentAddress, bool isWhitelisted);

    constructor() {
        _disableInitializers();
    }
    
    function initialize(
        address initialOwner,
        address identityRegistry_,
        address reputationRegistry_
    ) public initializer {
        __Ownable_init(initialOwner);
        __Pausable_init();
        __UUPSUpgradeable_init();
        identityRegistry = IIdentityRegistry(identityRegistry_);
        reputationRegistry = IReputationRegistryWrapper(reputationRegistry_);
    }

    function setRegistries(address identityRegistry_, address reputationRegistry_)
        external
        onlyOwner
    {
        identityRegistry = IIdentityRegistry(identityRegistry_);
        reputationRegistry = IReputationRegistryWrapper(reputationRegistry_);
        emit RegistriesUpdated(identityRegistry_, reputationRegistry_);
    }

    function deposit(string memory jobId, address worker) external payable whenNotPaused {
        require(msg.value > 0, "Zero deposit");
        require(!escrows[jobId].released, "This Job Finalized.");
        require(worker != address(0), "Invalid worker");

        escrows[jobId] = Escrow({
            depositor: msg.sender,
            worker: worker,
            amount: msg.value,
            released: false
        });

        emit Deposited(jobId, msg.sender, worker, msg.value);
    }

    function release(string memory jobId) public whenNotPaused {
        require(WhitelistedAgents[msg.sender], "You are not whitelisted");
        Escrow storage e = escrows[jobId];
        require(!e.released, "Already released");

        e.released = true;

        uint256 feeAmount = (e.amount * releaseFeeBps) / 10000;
        uint256 workerAmount = e.amount - feeAmount;

        if (workerAmount > 0) {
            (bool ok, ) = e.worker.call{value: workerAmount}("");
            require(ok, "ETH transfer to worker failed");
        }
        if (feeAmount > 0) {
            (bool okFee, ) = owner().call{value: feeAmount}("");
            require(okFee, "ETH fee transfer failed");
        }

        emit Released(jobId, e.worker, e.amount);
    }

    function setReleaseFee(uint256 feeBps) external onlyOwner {
        require(feeBps <= 10000, "Fee max 100%");
        releaseFeeBps = feeBps;
        emit ReleaseFeeUpdated(feeBps);
    }

    function setWhitelistStatus(address agentAddress, bool status) public onlyOwner {
        WhitelistedAgents[agentAddress] = status;
        emit AgentWhitelistChange(agentAddress, status);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

}