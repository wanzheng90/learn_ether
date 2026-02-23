// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

// FindMe: 一个最小可运行的捐款合约
// 你可以把它理解为：
// 1) 用户调用 fund() 往合约里打 ETH
// 2) 合约记录每个用户捐了多少
// 3) 只有 owner 可以 withdraw() 提现全部余额
contract FindMe {
    // 最小捐款金额（单位: wei）
    // 1e15 wei = 0.001 ETH
    uint256 public constant MIN_FUND_WEI = 1e15;

    // owner 在部署时写死为部署者地址，后续不可更改（immutable）
    address payable public immutable owner;

    // 每个地址累计捐款金额
    mapping(address => uint256) public donatedAmountByUser;

    // 捐款过的用户地址列表（用于前端展示）
    address[] public donatedUsers;

    // 构造函数：部署合约时执行一次
    constructor() payable {
        owner = payable(msg.sender);
    }

    // 捐款函数（用户调用）
    function fund() external payable {
        // msg.value 是本次交易附带的 ETH（wei）
        require(msg.value >= MIN_FUND_WEI, "Minimum donation is 0.001 ETH");

        // 只有第一次捐款的用户才加入数组，避免重复地址
        if (donatedAmountByUser[msg.sender] == 0) {
            donatedUsers.push(msg.sender);
        }

        // 累加用户总捐款
        donatedAmountByUser[msg.sender] += msg.value;
    }

    // 返回所有捐款人的地址和金额
    // 为什么不用直接返回 mapping？因为 mapping 不能被遍历
    function findAll() external view returns (User[] memory) {
        User[] memory users = new User[](donatedUsers.length);
        for (uint256 i = 0; i < donatedUsers.length; i++) {
            address userAddress = donatedUsers[i];
            users[i] = User(userAddress, donatedAmountByUser[userAddress]);
        }
        return users;
    }

    // 提现函数：仅 owner 可调用
    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw");

        // 提现前把记录清空，保持状态一致
        for (uint256 i = 0; i < donatedUsers.length; i++) {
            donatedAmountByUser[donatedUsers[i]] = 0;
        }
        delete donatedUsers;

        // 把合约内全部余额转给 owner
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}

// 前端使用的数据结构
struct User {
    address userAddress;
    uint256 amount;
}
