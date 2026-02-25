// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

error OnlyEven(uint256 value);

contract RevertLab {
    function mustBeEven(uint256 value) external pure returns (uint256) {
        if (value % 2 != 0) revert OnlyEven(value);
        return value;
    }

    function alwaysFails() external pure {
        revert("REVERT_REASON_SAMPLE");
    }
}
