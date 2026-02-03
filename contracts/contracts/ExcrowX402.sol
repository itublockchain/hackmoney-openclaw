// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Standart (non-upgradeable) OpenZeppelin kütüphanelerini kullanıyoruz
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

interface IIdentityRegistry {
    function getAgentIdByWallet(address wallet) external view returns (uint256);
}

interface IReputationRegistryWrapper {
    function getAverageReputation(uint256 agentId) external view returns (int256);
}

// IdentityRegistry - sepolia - 0x8004B663056A597Dffe9eCcC1965A193B7388713

contract EscrowX402 is Pausable, Ownable {
    struct Escrow {
        address depositor;
        address worker;
        uint256 amount;
        bool released;
    }

    uint256 public escrowCount;
    mapping(string => Escrow) public escrows;
    mapping(address => bool) public WhitelistedAgents;

    IIdentityRegistry public identityRegistry;
    IReputationRegistryWrapper public reputationRegistry;

    event Deposited(string jobId, address depositor, address worker, uint256 amount);
    event Released(string jobId, address worker, uint256 amount);
    event RegistriesUpdated(address identityRegistry, address reputationRegistry);
    event AgentWhitelistChange(address agentAddress, bool isWhitelisted);

    // Proxy olmadığı için her şeyi direkt constructor'da hallediyoruz
    constructor(
        address initialOwner,
        address identityRegistry_,
        address reputationRegistry_
    ) Ownable(initialOwner) { // Sahiplik burada başlar
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

    // ... (Diğer Core Logic fonksiyonların aynı kalıyor)

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
        (bool ok, ) = e.worker.call{value: e.amount}("");
        require(ok, "ETH transfer failed");

        emit Released(jobId, e.worker, e.amount);
    }

    function setWhitelistStatus(address agentAddress, bool status) public onlyOwner {
        WhitelistedAgents[agentAddress] = status;
        emit AgentWhitelistChange(agentAddress, status);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}