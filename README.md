
1. 修改UniswapV2Factory.sol合约获取init_code
    1. bytes32 public constant INIT_CODE_PAIR_HASH = keccak256(abi.encodePacked(type(UniswapV2Pair).creationCode));

2. 部署工厂合约

3. UniswapV2Factory.sol合约获取INIT_CODE_PAIR_HASH

4. 修改路由合约

5. 部署路由合约

6. 修改sdk
    1. 工厂合约地址
    2. INIT_CODE_PAIR_HASH
    3. chain id
    4. weth地址

7. 发布sdk到npm

8. 修改前端
    1. 路由合约地址
    2. 支持的chain id, supportedChainIds
    3. 浏览器链接，getEtherscanLink
    4. sdk包名
    5. multicall地址
    6. tokenlist

9. 部署前端