// contracts/test/Mocks.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // Ensure this matches a compatible pragma with your Chainlink contracts

import "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2Mock.sol";
import "@chainlink/contracts/src/v0.8/shared/token/ERC677/LinkToken.sol";

// You don't need any contract definition within this file,
// just the imports are enough to tell Hardhat to compile them.
// If you wanted to, you could define a dummy contract like this,
// but it's not strictly necessary for compilation purposes if imports suffice:
// contract TestMocks {}