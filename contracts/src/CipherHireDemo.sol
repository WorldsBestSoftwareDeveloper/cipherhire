// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CipherHireDemo
 * @notice Simplified version for live demo - accepts plaintext values
 * @dev In production this uses FHEVM encrypted types (see TaskManager.sol)
 * The full FHE version uses euint64 instead of uint64, TFHE.lt() for
 * comparisons, and Gateway.requestDecryption() for winner reveal
 */
contract CipherHireDemo {

    // ── Structs ───────────────────────────────────────────────────────────────
    struct Task {
        uint256 id;
        address creator;
        string title;
        string description;
        string category;
        uint256 createdAt;
        uint8 status;        // 0=Open 1=Computing 2=Completed 3=Cancelled
        uint256 bidCount;
        address winner;
        uint256 winningBid;
    }

    struct Bid {
        address provider;
        uint256 encryptedAmount; // In production: euint64 ciphertext handle
        uint256 deliveryDays;
        uint256 submittedAt;
        bool exists;
    }

    // ── State ─────────────────────────────────────────────────────────────────
    uint256 public taskCounter;
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => mapping(address => Bid)) public bids;
    mapping(uint256 => address[]) public taskBidders;

    // ── Events ────────────────────────────────────────────────────────────────
    event TaskCreated(
        uint256 indexed taskId,
        address indexed creator,
        string title,
        string category,
        uint256 timestamp
    );
    event BidSubmitted(
        uint256 indexed taskId,
        address indexed provider,
        uint256 deliveryDays
    );
    event WinnerSelected(
        uint256 indexed taskId,
        address indexed winner,
        uint256 winningBid
    );
    event MatchingStarted(uint256 indexed taskId, uint256 bidCount);

    // ── Errors ────────────────────────────────────────────────────────────────
    error TaskNotFound();
    error AlreadyBid();
    error NotEnoughBids();
    error TaskNotOpen();

    // ── Create Task ───────────────────────────────────────────────────────────
    /**
     * @notice Create a task with a budget
     * @dev In FHE version: budget is euint64, encrypted client-side with fhevmjs
     *      Here we accept uint256 to enable live demo transactions on Sepolia
     */
    function createTask(
        string calldata title,
        string calldata description,
        string calldata category,
        uint256 budget
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Empty title");
        require(bytes(description).length > 0, "Empty description");
        require(budget > 0, "Budget must be positive");

        taskCounter++;
        uint256 taskId = taskCounter;

        tasks[taskId] = Task({
            id: taskId,
            creator: msg.sender,
            title: title,
            description: description,
            category: category,
            createdAt: block.timestamp,
            status: 0,
            bidCount: 0,
            winner: address(0),
            winningBid: 0
        });

        emit TaskCreated(taskId, msg.sender, title, category, block.timestamp);
        return taskId;
    }

    // ── Submit Bid ────────────────────────────────────────────────────────────
    /**
     * @notice Submit a bid for a task
     * @dev In FHE version: amount is euint64 ciphertext, comparison done with
     *      TFHE.lt() — no plaintext ever used during matching
     */
    function submitBid(
        uint256 taskId,
        uint256 amount,
        uint256 deliveryDays
    ) external {
        if (taskId == 0 || taskId > taskCounter) revert TaskNotFound();
        if (tasks[taskId].status != 0) revert TaskNotOpen();
        if (bids[taskId][msg.sender].exists) revert AlreadyBid();
        require(amount > 0, "Bid must be positive");
        require(deliveryDays > 0 && deliveryDays <= 365, "Invalid delivery");

        bids[taskId][msg.sender] = Bid({
            provider: msg.sender,
            encryptedAmount: amount,
            deliveryDays: deliveryDays,
            submittedAt: block.timestamp,
            exists: true
        });

        taskBidders[taskId].push(msg.sender);
        tasks[taskId].bidCount++;

        emit BidSubmitted(taskId, msg.sender, deliveryDays);
    }

    // ── Run Matching ──────────────────────────────────────────────────────────
    /**
     * @notice Find the lowest bid and select winner
     * @dev In FHE version this uses:
     *      TFHE.lt(bidA, bidB) -> encrypted comparison
     *      TFHE.select(cond, a, b) -> encrypted selection
     *      Gateway.requestDecryption() -> reveal only winner
     *      Here we do plaintext comparison for live demo
     */
    function runMatching(uint256 taskId) external {
        if (taskId == 0 || taskId > taskCounter) revert TaskNotFound();
        if (tasks[taskId].status != 0) revert TaskNotOpen();

        address[] memory bidders = taskBidders[taskId];
        if (bidders.length < 2) revert NotEnoughBids();

        tasks[taskId].status = 1;
        emit MatchingStarted(taskId, bidders.length);

        // Find lowest bid (in FHE version this is TFHE.lt + TFHE.select)
        uint256 lowestBid = bids[taskId][bidders[0]].encryptedAmount;
        address winner = bidders[0];

        for (uint256 i = 1; i < bidders.length; i++) {
            uint256 currentBid = bids[taskId][bidders[i]].encryptedAmount;
            if (currentBid < lowestBid) {
                lowestBid = currentBid;
                winner = bidders[i];
            }
        }

        tasks[taskId].winner = winner;
        tasks[taskId].winningBid = lowestBid;
        tasks[taskId].status = 2;

        emit WinnerSelected(taskId, winner, lowestBid);
    }

    // ── Views ─────────────────────────────────────────────────────────────────
    function getTask(uint256 taskId) external view returns (Task memory) {
        if (taskId == 0 || taskId > taskCounter) revert TaskNotFound();
        return tasks[taskId];
    }

    function getBid(uint256 taskId, address provider)
        external view returns (Bid memory)
    {
        return bids[taskId][provider];
    }

    function getTaskBidders(uint256 taskId)
        external view returns (address[] memory)
    {
        return taskBidders[taskId];
    }

    function getActiveTasks() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= taskCounter; i++) {
            if (tasks[i].status == 0) count++;
        }
        uint256[] memory ids = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= taskCounter; i++) {
            if (tasks[i].status == 0) ids[idx++] = i;
        }
        return ids;
    }
}