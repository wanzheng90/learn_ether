// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

interface IVRFCoordinatorLike {
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 requestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId);
}

// 前端使用的数据结构
struct User {
    address userAddress;
    uint256 amount;
}

// FindMe + VRF:
// 1) 用户调用 fund() 捐款，合约向 VRF 请求随机数
// 2) 协调器回调 fulfillRandomWords() 后结算返现
// 3) 只有 owner 可以 withdraw() 提现全部余额
contract FindMe {
    uint256 public constant MIN_FUND_WEI = 1e15; // 0.001 ETH
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant MAX_REFUND_BPS = 3_000; // 最高返还 30%
    uint32 public constant VRF_NUM_WORDS = 1;

    address payable public immutable owner;
    IVRFCoordinatorLike public immutable coordinator;
    bytes32 public immutable keyHash;
    uint64 public immutable subscriptionId;
    uint16 public immutable requestConfirmations;
    uint32 public immutable callbackGasLimit;

    mapping(address => uint256) public donatedAmountByUser;
    address[] public donatedUsers;
    uint256 private unlocked = 1;
    uint256 public pendingDonationCount;

    struct PendingDonation {
        address donor;
        uint256 grossAmount;
        bool exists;
    }

    mapping(uint256 => PendingDonation) public pendingDonations;

    event DonationRequested(
        address indexed donor,
        uint256 indexed requestId,
        uint256 grossAmount
    );
    event DonationProcessed(
        address indexed donor,
        uint256 indexed requestId,
        uint256 grossAmount,
        uint256 refundAmount,
        uint256 netAmount,
        uint256 refundBps
    );

    modifier nonReentrant() {
        require(unlocked == 1, "Reentrancy blocked");
        unlocked = 2;
        _;
        unlocked = 1;
    }

    constructor(
        address coordinatorAddress,
        uint64 subId,
        bytes32 vrfKeyHash,
        uint16 vrfRequestConfirmations,
        uint32 vrfCallbackGasLimit
    ) payable {
        owner = payable(msg.sender);
        coordinator = IVRFCoordinatorLike(coordinatorAddress);
        subscriptionId = subId;
        keyHash = vrfKeyHash;
        requestConfirmations = vrfRequestConfirmations;
        callbackGasLimit = vrfCallbackGasLimit;
    }

    // 捐款函数：先记 pending，再在 VRF 回调时结算
    function fund() external payable nonReentrant {
        require(msg.value >= MIN_FUND_WEI, "Minimum donation is 0.001 ETH");

        uint256 requestId = coordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            VRF_NUM_WORDS
        );
        pendingDonations[requestId] = PendingDonation({
            donor: msg.sender,
            grossAmount: msg.value,
            exists: true
        });
        pendingDonationCount += 1;

        emit DonationRequested(msg.sender, requestId, msg.value);
    }

    // 协调器回调，完成返现结算
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external nonReentrant {
        require(
            msg.sender == address(coordinator),
            "Only coordinator can fulfill"
        );
        require(randomWords.length > 0, "Random words missing");

        PendingDonation memory pending = pendingDonations[requestId];
        require(pending.exists, "Unknown request");

        delete pendingDonations[requestId];
        pendingDonationCount -= 1;

        uint256 refundBps = randomWords[0] % (MAX_REFUND_BPS + 1);
        uint256 refundAmount = (pending.grossAmount * refundBps) / BPS_DENOMINATOR;
        uint256 netAmount = pending.grossAmount - refundAmount;

        if (donatedAmountByUser[pending.donor] == 0 && netAmount > 0) {
            donatedUsers.push(pending.donor);
        }
        donatedAmountByUser[pending.donor] += netAmount;

        if (refundAmount > 0) {
            (bool refundOk, ) = payable(pending.donor).call{value: refundAmount}("");
            require(refundOk, "Refund failed");
        }

        emit DonationProcessed(
            pending.donor,
            requestId,
            pending.grossAmount,
            refundAmount,
            netAmount,
            refundBps
        );
    }

    function findAll() external view returns (User[] memory) {
        User[] memory users = new User[](donatedUsers.length);
        for (uint256 i = 0; i < donatedUsers.length; i++) {
            address userAddress = donatedUsers[i];
            users[i] = User(userAddress, donatedAmountByUser[userAddress]);
        }
        return users;
    }

    function withdraw() external nonReentrant {
        require(msg.sender == owner, "Only the owner can withdraw");
        require(pendingDonationCount == 0, "Pending VRF donations exist");

        for (uint256 i = 0; i < donatedUsers.length; i++) {
            donatedAmountByUser[donatedUsers[i]] = 0;
        }
        delete donatedUsers;

        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
