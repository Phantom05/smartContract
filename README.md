# YGGDRASH CROWDSALE SmatrContract In Ethereum
## Solidity compiler
- build Version : 0.4.11+commit.68ef5810.Darwin.appleclang

## Truffle 
- Version : Truffle v3.4.3

## Description
### YGGDRASH 클라우드세일 컨트렉트 주요기능
- YEED TOKEN 전송
- 세일전 설정 변경
- 단 1회 참여만 (Address 및 추가데이터 검증) 가능
- 추가데이터를 통하여 참여 어드레이스 확인
- 어드레이스를 통하여 참여 데이터 확인
- Max GasPrice 설정
 
### YGGDRASH YEED 
- 일반적인 ERC20 기반 토큰
- 잠금 가능 ( 전체 전송가능 설정 전, 후 )
- 해제 가능 ( 전체 전송가능 설정 전, 후 )
- 토큰소각 가능 ( 전송 가능시 )

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

