// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract IndexerSource {
    event NumberSet(uint256 indexed id, uint256 value);

    uint256 public nextId;

    function setNumber(uint256 value) external {
        emit NumberSet(nextId, value);
        unchecked {
            nextId++;
        }
    }
}
