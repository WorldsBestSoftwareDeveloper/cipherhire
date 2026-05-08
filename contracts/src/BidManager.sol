// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";

/**
 * @title BidManager
 * @notice Stores and manages encrypted provider bids using Zama FHEVM
 * @dev All bid amounts are euint64 ciphertexts — never revealed until winner selection
 */
contract BidManager is SepoliaZamaFHEVMConfig {

    struct Bid {
        uint256 taskId;
        address provider;
        euint64 encryptedAmount;   // FHE ciphertext — no plaintext on-chain
        uint256 deliveryDays;
        uint256 submittedAt;
        bool exists;
    }

    // taskId => provider => Bid
    mapping(uint256 => mapping(address => Bid)) public bids;
    // taskId => list of providers who bid
    mapping(uint256 => address[]) public taskProviders;
    // provider => list of taskIds they bid on
    mapping(address => uint256[]) public providerTasks;

    address public matchingEngine;
    address public taskManager;

    // ── Events ──────────────────────────────────────────────────────────────
    event BidSubmitted(uint256 indexed taskId, address indexed provider, uint256 deliveryDays);
    event BidRevoked(uint256 indexed taskId, address indexed provider);

    // ── Errors ───────────────────────────────────────────────────────────────
    error AlreadyBid();
    error NoBidFound();
    error Unauthorized();

    modifier onlyMatchingEngine() {
        if (msg.sender != matchingEngine) revert Unauthorized();
        _;
    }

    constructor(address _taskManager) {
        taskManager = _taskManager;
    }

    function setMatchingEngine(address _matchingEngine) external {
        // In production: use Ownable. Simplified here for clarity.
        require(matchingEngine == address(0), "Already set");
        matchingEngine = _matchingEngine;
    }

    // ── Core: Submit Encrypted Bid ───────────────────────────────────────────
    /**
     * @notice Provider submits an encrypted bid for a task
     * @param taskId              The task to bid on
     * @param encryptedBidInput   Client-side encrypted bid amount (fhevmjs)
     * @param inputProof          ZK proof from fhevmjs
     * @param deliveryDays        Estimated delivery (public — not sensitive)
     */
    function submitBid(
        uint256 taskId,
        einput encryptedBidInput,
        bytes calldata inputProof,
        uint256 deliveryDays
    ) external {
        if (bids[taskId][msg.sender].exists) revert AlreadyBid();
        require(deliveryDays > 0 && deliveryDays <= 365, "Invalid delivery days");

        // Validate ciphertext and create on-chain euint64 handle
        euint64 encAmount = TFHE.asEuint64(encryptedBidInput, inputProof);

        // Allow this contract, the MatchingEngine, and the provider to use the handle
        TFHE.allowThis(encAmount);
        TFHE.allow(encAmount, matchingEngine);
        TFHE.allow(encAmount, msg.sender);

        bids[taskId][msg.sender] = Bid({
            taskId: taskId,
            provider: msg.sender,
            encryptedAmount: encAmount,
            deliveryDays: deliveryDays,
            submittedAt: block.timestamp,
            exists: true
        });

        taskProviders[taskId].push(msg.sender);
        providerTasks[msg.sender].push(taskId);

        emit BidSubmitted(taskId, msg.sender, deliveryDays);
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    function getTaskProviders(uint256 taskId) external view returns (address[] memory) {
        return taskProviders[taskId];
    }

    function getBidDeliveryDays(uint256 taskId, address provider)
        external
        view
        returns (uint256)
    {
        require(bids[taskId][provider].exists, "No bid");
        return bids[taskId][provider].deliveryDays;
    }

    function getBidSubmittedAt(uint256 taskId, address provider)
        external
        view
        returns (uint256)
    {
        require(bids[taskId][provider].exists, "No bid");
        return bids[taskId][provider].submittedAt;
    }

    /**
     * @notice Returns encrypted bid handle — only usable by MatchingEngine (ACL-protected)
     */
    function getEncryptedBid(uint256 taskId, address provider)
        external
        view
        returns (euint64)
    {
        require(bids[taskId][provider].exists, "No bid");
        return bids[taskId][provider].encryptedAmount;
    }

    function getBidCount(uint256 taskId) external view returns (uint256) {
        return taskProviders[taskId].length;
    }

    function hasBid(uint256 taskId, address provider) external view returns (bool) {
        return bids[taskId][provider].exists;
    }
}
