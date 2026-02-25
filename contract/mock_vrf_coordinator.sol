// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

interface IVRFConsumerLike {
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external;
}

contract MockVRFCoordinator {
    uint256 private nextRequestId = 1;

    struct Request {
        address requester;
        bool fulfilled;
    }

    mapping(uint256 => Request) public requests;

    event RandomWordsRequested(uint256 indexed requestId, address requester);
    event RandomWordsFulfilled(uint256 indexed requestId, uint256 randomWord);

    function requestRandomWords(
        bytes32,
        uint64,
        uint16,
        uint32,
        uint32
    ) external returns (uint256 requestId) {
        requestId = nextRequestId++;
        requests[requestId] = Request({requester: msg.sender, fulfilled: false});
        emit RandomWordsRequested(requestId, msg.sender);
    }

    function fulfillRequest(uint256 requestId, uint256 randomWord) external {
        Request storage req = requests[requestId];
        require(req.requester != address(0), "Unknown request");
        require(!req.fulfilled, "Already fulfilled");
        req.fulfilled = true;

        uint256[] memory words = new uint256[](1);
        words[0] = randomWord;
        IVRFConsumerLike(req.requester).fulfillRandomWords(requestId, words);

        emit RandomWordsFulfilled(requestId, randomWord);
    }
}
