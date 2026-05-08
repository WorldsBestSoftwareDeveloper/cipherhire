// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title TaskManager
 * @notice Manages AI service tasks with FHE-encrypted budgets on Zama FHEVM
 * @dev Budgets are stored as euint64 — never exposed on-chain in plaintext
 */
contract TaskManager is SepoliaZamaFHEVMConfig, GatewayCaller {

    struct Task {
        uint256 id;
        address creator;
        string title;
        string description;
        string category;
        euint64 encryptedBudget;      // FHE-encrypted — no plaintext ever stored
        uint256 createdAt;
        uint8 status;                 // 0=Open 1=Computing 2=Completed 3=Cancelled
        uint256 bidCount;
        address winner;
        uint256 revealedWinningBid;   // Only set after Gateway decrypt callback
    }

    uint256 public taskCounter;
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => address[]) public taskBidders;

    // ── Events ──────────────────────────────────────────────────────────────
    event TaskCreated(
        uint256 indexed taskId,
        address indexed creator,
        string title,
        string category,
        uint256 timestamp
    );
    event TaskStatusUpdated(uint256 indexed taskId, uint8 status);
    event WinnerRevealed(uint256 indexed taskId, address indexed winner, uint256 winningBid);

    // ── Errors ───────────────────────────────────────────────────────────────
    error TaskNotFound();
    error NotTaskCreator();
    error TaskNotOpen();

    modifier taskExists(uint256 taskId) {
        if (taskId == 0 || taskId > taskCounter) revert TaskNotFound();
        _;
    }

    // ── Core: Create Task ───────────────────────────────────────────────────
    /**
     * @notice Create a task with an FHE-encrypted budget
     * @param encryptedBudgetInput  Ciphertext from client-side fhevmjs encryption
     * @param inputProof            ZK proof generated alongside the ciphertext
     */
    function createTask(
        string calldata title,
        string calldata description,
        string calldata category,
        einput encryptedBudgetInput,
        bytes calldata inputProof
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Empty title");
        require(bytes(description).length > 0, "Empty description");

        taskCounter++;
        uint256 taskId = taskCounter;

        // Validate ciphertext + proof, produce on-chain euint64 handle
        euint64 encBudget = TFHE.asEuint64(encryptedBudgetInput, inputProof);

        // Allow this contract and the creator to use the ciphertext handle
        TFHE.allowThis(encBudget);
        TFHE.allow(encBudget, msg.sender);

        tasks[taskId] = Task({
            id: taskId,
            creator: msg.sender,
            title: title,
            description: description,
            category: category,
            encryptedBudget: encBudget,
            createdAt: block.timestamp,
            status: 0,
            bidCount: 0,
            winner: address(0),
            revealedWinningBid: 0
        });

        emit TaskCreated(taskId, msg.sender, title, category, block.timestamp);
        return taskId;
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    function getTask(uint256 taskId)
        external
        view
        taskExists(taskId)
        returns (
            uint256 id,
            address creator,
            string memory title,
            string memory description,
            string memory category,
            uint256 createdAt,
            uint8 status,
            uint256 bidCount,
            address winner,
            uint256 revealedWinningBid
        )
    {
        Task storage t = tasks[taskId];
        return (
            t.id, t.creator, t.title, t.description, t.category,
            t.createdAt, t.status, t.bidCount, t.winner, t.revealedWinningBid
        );
    }

    function getEncryptedBudget(uint256 taskId)
        external
        view
        taskExists(taskId)
        returns (euint64)
    {
        return tasks[taskId].encryptedBudget;
    }

    // ── State mutators (called by MatchingEngine) ────────────────────────────
    function updateTaskStatus(uint256 taskId, uint8 status) external taskExists(taskId) {
        tasks[taskId].status = status;
        emit TaskStatusUpdated(taskId, status);
    }

    function incrementBidCount(uint256 taskId) external taskExists(taskId) {
        tasks[taskId].bidCount++;
        taskBidders[taskId].push(msg.sender);
    }

    function recordWinner(uint256 taskId, address winner, uint256 winningBid)
        external
        taskExists(taskId)
    {
        Task storage t = tasks[taskId];
        t.winner = winner;
        t.revealedWinningBid = winningBid;
        t.status = 2;
        emit WinnerRevealed(taskId, winner, winningBid);
    }

    function cancelTask(uint256 taskId) external taskExists(taskId) {
        if (tasks[taskId].creator != msg.sender) revert NotTaskCreator();
        if (tasks[taskId].status != 0) revert TaskNotOpen();
        tasks[taskId].status = 3;
    }

    // ── View helpers ─────────────────────────────────────────────────────────
    function getActiveTasks() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= taskCounter; i++) {
            if (tasks[i].status == 0) count++;
        }
        uint256[] memory activeIds = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= taskCounter; i++) {
            if (tasks[i].status == 0) activeIds[idx++] = i;
        }
        return activeIds;
    }
}
