// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// Address库
library String {
    
    function bytes32ToString(bytes32 _bytes32)
        internal
        pure
        returns (string memory)
    {
        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    function stringToBytes32(string memory str)
        internal
        pure
        returns (bytes32 result)
    {
        require(bytes(str).length <= 32, "String too long");
        assembly {
            result := mload(add(str, 32))
        }
    }
}
