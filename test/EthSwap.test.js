const { assert } = require('chai')

const Token = artifacts.require('Token')
const EthSwap = artifacts.require('EthSwap')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}


contract('EthSwap', ([deployer,  investor]) => {
    let token, ethswap

    before(async () => {
        token = await Token.new()
        ethswap = await EthSwap.new(token.address)
        await token.transfer(ethswap.address, tokens('1000000'))
    })

    describe('Token deployment', async () => {
        it('token has a name', async () => {
            
            const name = await token.name()
            assert.equal(name, "DApp Token")
        })
    })

    describe('EthSwap deployment', async () => {
        it('contract has a name', async () => {
            
            const name = await ethswap.name()
            assert.equal(name, "EthSwap Exchange")
        })

        it('contract has tokens', async () => { 
            let balance = await token.balanceOf(ethswap.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('buyTokens()', async () => {
        let result

        before(async () => {
            // Purchase tokens before each example
            result = await ethswap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether') })
        })

        it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async () => {
            // Check investor token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))

            // Check ethSwap balance after purchase
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethswap.address)
            assert.equal(ethSwapBalance.toString(), tokens('999900'))
            ethSwapBalance = await web3.eth.getBalance(ethswap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'Ether'))

            //Check logs to ensure event was  emitted with the correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })
    })

    describe('sellTokens()', async () => {
        let result

        before(async () => {
            //Investor must approve tokens efore the purchase
            await token.approve(ethswap.address, tokens('100'), { from: investor })
            
            //Investor sell tokens
            result = await ethswap.sellTokens(tokens('100'), {from: investor})
        })

        it('Allows user to instantly sell tokens from ethSwap for a fixed price', async () => {
            // Check investor token balance after sale
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('0'))

            // Check ethSwap balance after sale
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethswap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1000000'))
            ethSwapBalance = await web3.eth.getBalance(ethswap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'Ether'))

            //Check logs to ensure event was  emitted with the correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
            
            //FAILURE: Investor can't sell more tokens than they have
            await ethswap.sellTokens(tokens('500'), { from: investor }).should.be.rejected;
            
        })
    })

})