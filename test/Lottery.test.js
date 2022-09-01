const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const web3 = new Web3(ganache.provider())

const { interface, bytecode } = require('../compile')

let lottery
let accounts

beforeEach(async () => {
    accounts = await web3.eth.getAccounts()

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: "1000000" })
}
)

describe("Lottery contract", () => {
    it("deploys a contract", () => {
        assert.ok(lottery.options.address)
    })
    it("has manager", async () => {
        assert.ok(await lottery.methods.manager().call(), accounts[0])
    })
    it("allows one account to enter", async () => {
        await lottery.methods.enter()
            .send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', "ether")
            })
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        assert.ok(players.length == 1)
        assert.equal(players[0], accounts[0])
    })
    it("allows multiple accounts to enter", async () => {
        await lottery.methods.enter()
            .send({
                from: accounts[0],
                value: web3.utils.toWei('0.02', "ether")
            })
        await lottery.methods.enter()
            .send({
                from: accounts[1],
                value: web3.utils.toWei('0.02', "ether")
            })
        await lottery.methods.enter()
            .send({
                from: accounts[2],
                value: web3.utils.toWei('0.02', "ether")
            })

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        assert.ok(players.length == 3)
        assert.equal(players[0], accounts[0])
        assert.equal(players[1], accounts[1])
        assert.equal(players[2], accounts[2])

    })
    it("requires minimum amount of ether to enter", async () => {
        try {
            await lottery.methods.enter()
                .send({
                    from: accounts[0],
                    value: web3.utils.toWei("0.001", "ether")
                })
            assert(false) //ini bikin test gagal, seandainya ga error padahal valuenya kurang
        } catch (err) {
            assert(err) //check if present
        }

    })
    it("only manager can call pickWinner", async () => {
        try {
            await lottery.methods.pickWinner().send({ from: accounts[1] })
            assert(false)
        } catch (err) {
            assert(err)
        }
    })
    it("sends money to the winner and reset players", async () => {
        //Enter
        await lottery.methods.enter()
            .send({
                from: accounts[0],
                value: web3.utils.toWei('2', "ether")
            })

        //Get balance before
        const beforeBalance = await web3.eth.getBalance(accounts[0])

        //Pick winner
        await lottery.methods.pickWinner().send({ from: accounts[0] })

        //Check accounts balance
        const afterBalance = await web3.eth.getBalance(accounts[0])
        const diff = afterBalance - beforeBalance

        assert.ok(diff > web3.utils.toWei('1.8', 'ether'))


    })
})