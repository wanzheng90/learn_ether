// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

error InvalidSigner(address expected, address got);
error InvalidNonce(uint256 expected, uint256 got);

contract EIP712Verifier {
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant MAIL_TYPEHASH =
        keccak256("Mail(address from,address to,uint256 amount,uint256 nonce)");

    mapping(address => uint256) public nonces;

    constructor(string memory name, string memory version) {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                block.chainid,
                address(this)
            )
        );
    }

    struct Mail {
        address from;
        address to;
        uint256 amount;
        uint256 nonce;
    }

    function verifyAndConsume(Mail calldata mail, bytes calldata signature) external returns (bool) {
        uint256 expected = nonces[mail.from];
        if (mail.nonce != expected) revert InvalidNonce(expected, mail.nonce);

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(MAIL_TYPEHASH, mail.from, mail.to, mail.amount, mail.nonce))
            )
        );

        address recovered = _recover(digest, signature);
        if (recovered != mail.from) revert InvalidSigner(mail.from, recovered);

        nonces[mail.from] = expected + 1;
        return true;
    }

    function _recover(bytes32 digest, bytes calldata signature) private pure returns (address) {
        require(signature.length == 65, "bad sig length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        if (v < 27) v += 27;
        require(v == 27 || v == 28, "bad v");
        return ecrecover(digest, v, r, s);
    }
}
