pragma solidity =0.5.16;

contract HelloWorld{
    event Hello(address from);

    function hello() public{
        emit Hello(msg.sender);
    }
}