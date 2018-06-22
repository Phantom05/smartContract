# YGGDRASH CROWDSALE SmatrContract In Ethereum
## Solidity compiler
- build Version : 0.4.11+commit.68ef5810.Darwin.appleclang

## Truffle 
- Version : Truffle v4.1.0 (core: 4.1.0)

## Description
 
### YGGDRASH YEED 
- 일반적인 ERC20 기반 토큰
- 토큰소각 가능
- 어드민 기능
  - 어드민 기능 잠금/해제
  - 전체 전송 잠금/해제
  - 전체 전송 자금시 화이트리스트 관리
  - 전체 전송 해제시 블랙리스트 관리
  - 위험상황에서 지갑토큰 회수 기능  

### SafeTokenTransfer
- dumpToken 전송시, 이중지급 방지기능
- 토큰 approve 상태에서 실행가능

### SwapToken
- 이전토큰과 신규토큰을 1:1 비율로 지급 가능
- 신규 토큰 approve 량만큼만 지급

## Dependencies
We use Truffle in order to compile and test the contracts.

It can be installed:
`npm install -g truffle`

For more information visit https://truffle.readthedocs.io/en/latest/

Also running node with active json-rpc is required. For testing puproses we suggest using https://github.com/ethereumjs/testrpc
## Usage
`./run_testrpc.sh` - run testrpc node with required params

`truffle compile` - compile all contracts

`truffle test` - run tests

