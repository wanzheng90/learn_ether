// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

error NotOwner(address caller);
error MissingRole(bytes32 role, address caller);

contract AccessControlLab {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    address public owner;
    mapping(bytes32 => mapping(address => bool)) public hasRole;

    constructor() {
        owner = msg.sender;
        hasRole[ADMIN_ROLE][msg.sender] = true;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    modifier onlyRole(bytes32 role) {
        if (!hasRole[role][msg.sender]) revert MissingRole(role, msg.sender);
        _;
    }

    function grantRole(bytes32 role, address account) external onlyOwner {
        hasRole[role][account] = true;
    }

    function revokeRole(bytes32 role, address account) external onlyOwner {
        hasRole[role][account] = false;
    }

    function adminAction() external view onlyRole(ADMIN_ROLE) returns (uint256) {
        return 42;
    }
}
