// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract FindMe {
    address payable public immutable owner;

    mapping(address => uint) doilateUserMap;
    address[] public doilateUsers;

    constructor() payable {
        owner = payable(msg.sender);
    }

    function findAll() public view returns (User[] memory) {
        User[] memory users = new User[](doilateUsers.length);
        for (uint i = 0; i < doilateUsers.length; i++) {
            address userAddress = doilateUsers[i];
            users[i] = User(userAddress, doilateUserMap[userAddress]);
        }
        return users;
    }

    // 提现
    function withdraw() public {
        require(msg.sender == owner, "Only the owner can withdraw");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}

struct User {
    address userAddress;
    uint amount;
}
