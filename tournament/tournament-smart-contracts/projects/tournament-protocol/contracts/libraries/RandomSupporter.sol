pragma solidity ^0.8.0;

library RandomSupporter{

    function getRandomNumbers(uint256 n, uint256 range) public view returns (uint256[] memory) {
        require(n <= range, "Cannot generate more unique numbers than the range allows");
        uint256[] memory numbers = new uint256[](n);
        uint256 count = 0;
        while (count < n) {
            uint256 number = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender, count))) % range;
            bool alreadyExists = false;
            for (uint256 i = 0; i < count; i++) {
                if (numbers[i] == number) {
                    alreadyExists = true;
                    break;
                }
            }
            if (!alreadyExists) {
                numbers[count] = number;
                count++;
            }
        }
        return numbers;
    }

}