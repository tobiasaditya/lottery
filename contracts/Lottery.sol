pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

    function Lottery() public {
        manager = msg.sender;
        lastWinner = "";
    }

    function enter() public payable {
        require(msg.value > 0.01 ether);
        players.push(msg.sender);
    }

    function pickWinner() public restricted {
        uint256 index = random() % players.length;
        lastWinner = players[index];
        players[index].transfer(this.balance);
        players = new address[](0); //reset players
    }

    function getPlayers() public view returns (address[]) {
        return players;
    }

    function random() private view returns (uint256) {
        return uint256(keccak256(block.difficulty, now, players));
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}
