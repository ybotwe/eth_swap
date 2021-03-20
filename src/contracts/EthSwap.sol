//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.8.0;

import './Token.sol';

contract EthSwap{
    string public name = "EthSwap Exchange";
    Token public token;
    uint public rate = 100;

    event TokenPurchased(
        address indexed account,
        address token,
        uint256 amount,
        uint rate
    );

    event TokenSold(
        address indexed account,
        address token,
        uint256 amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {

        //Calculate the tokens to buy
        uint tokenAmount = msg.value * rate;

        //Check if tokens are available
        require(token.balanceOf(address(this)) >= tokenAmount);

        //Transfer tokens to buyer.
        token.transfer(msg.sender, tokenAmount);

        //Emit an event 
        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate); 
    }

    function sellTokens(uint _amount) public {
        //User cannot sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        //Calculate the amount of ether to redeem
        uint etherAmount = _amount / rate;

        //Check if ether is available
        require(address(this).balance >= etherAmount);

        //Perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        //Emit an event 
        emit TokenSold(msg.sender, address(token), _amount, rate); 
    }

    
}