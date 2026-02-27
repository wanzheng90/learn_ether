// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract SimpleUpgradeableProxy {
    bytes32 private constant IMPLEMENTATION_SLOT =
        bytes32(uint256(keccak256("learn.lab.proxy.implementation")) - 1);

    bytes32 private constant ADMIN_SLOT =
        bytes32(uint256(keccak256("learn.lab.proxy.admin")) - 1);

    

    constructor(address implementation_, bytes memory initData) {
        address admin = msg.sender;
        bytes32 slot = ADMIN_SLOT;
        assembly {
            sstore(slot, admin)
        }
        _setImplementation(implementation_);
        if (initData.length > 0) {
            (bool ok, ) = implementation_.delegatecall(initData);
            require(ok, "init failed");
        }
    }

    function upgradeTo(address newImplementation) external {
        bytes32 slot = ADMIN_SLOT;
        address admin;
        assembly {
            admin := sload(slot)
        }
        require(msg.sender == admin, "not admin");
        _setImplementation(newImplementation);
    }

    function implementation() external view returns (address impl) {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }

    function _setImplementation(address impl) private {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            sstore(slot, impl)
        }
    }

    fallback() external payable {
        _delegate();
    }

    receive() external payable {
        _delegate();
    }

    function _delegate() private {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            let impl := sload(slot)
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}

contract CounterV1 {
    uint256 public value;

    function setValue(uint256 newValue) external {
        value = newValue;
    }
}

contract CounterV2 {
    uint256 public value;

    function setValue(uint256 newValue) external {
        value = newValue;
    }

    function increment() external {
        value += 1;
    }

    function version() external pure returns (uint256) {
        return 2;
    }
}
