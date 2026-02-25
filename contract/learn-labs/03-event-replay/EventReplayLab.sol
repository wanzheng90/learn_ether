// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract EventReplayLab {
    event Ping(address indexed from, uint256 indexed id, string message);

    uint256 public nextId;

    function ping(string calldata message) external {
        emit Ping(msg.sender, nextId, message);
        unchecked {
            nextId++;
        }
    }
}
