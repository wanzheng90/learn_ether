# FindMe Contract Documentation
这是一个简单的智能合约，用于练习web3开发。目的
 1. 智能合约开发，Solidity
 2. 与智能合约交互，ethers.js
 3. 智能合约测试，Hardhat


# Contract Overview 合约概述
本项目主要实现一个捐款合约，用户可以向合约捐款，并且可以查询捐款总额，合约发布者可以提现。包含两个合约stotrage和findme，stotrage合约用于后端，findme合约用于前端。
stotrage合约功能和函数：
    1. 存钱
    2. 取钱

findme合约功能和函数：
    1. 接受钱
    2. 取钱，验证必须是合约发布者才有权限
    3. 查找有多少人捐了钱，分别是谁，捐了多少

## Functions 函数
### findMe
- **Description**: 当调用此函数时，它会返回一条消息，表示用户已经找到了合约。
- **Returns**: `string memory` - 返回一条字符串消息。
### withdraw
- **Description**: 这是一个未实现的函数，未来可能用于提取资金或其他功能。
- **Returns**: 无返回值，目前未定义。
## Constructor
- **Description**: 构造函数，在部署合约时调用，目前没有任何逻辑。
## Usage