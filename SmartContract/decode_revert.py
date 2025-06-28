from eth_abi import decode
from web3 import Web3

def decode_solidity_custom_error(revert_data: str):
    """
    Decodes Solidity custom error revert data.

    Args:
        revert_data (str): The raw revert data string (e.g., "0x025dbdd4").

    Returns:
        tuple: A tuple containing the 4-byte selector and potentially the decoded error name.
               Returns None if the data is not a 4-byte selector.
    """
    if not revert_data.startswith("0x"):
        revert_data = "0x" + revert_data

    # Ensure it's exactly 4 bytes (plus "0x") for a selector without arguments
    if len(revert_data) != 10: # "0x" + 8 hex chars (4 bytes)
        print(f"Warning: Revert data '{revert_data}' is not a 4-byte selector.")
        # If it's longer, it might have arguments, which would require the ABI of the error
        return None, None

    selector = revert_data[:10] # Get the 0x + 4 bytes

    # Common error signatures to test against
    common_errors = [
        "InvalidReceiver()",
        "UnauthorizedCaller()",
        "ZeroAmount()",
        "InvalidChainSelector()",
        "InsufficientFee()",
        "NoTokensReceived()",
        "MalformedMessageData()",
        "UnknownMessageType()",
        "RateLimitExceeded()",
        "InvalidStrategyId()",
        # Add any other custom errors from your contracts here:
        "AavePoolUnavailable()",
        "InsufficientBalance()",
        "InsufficientParticipants()",
        "InsufficientRewardFunds()",
        "InvalidPriceFeed()",
        "InvalidSlippage()",
        "InvalidStrategy()",
        "InvalidVRFRequest()",
        "OperationInProgress()",
        "OwnableInvalidOwner(address)", # Has an argument
        "OwnableUnauthorizedAccount(address)", # Has an argument
        "Paused()",
        "PriceManipulationDetected()",
        "RebalanceNotNeeded()",
        "ReentrancyGuardReentrantCall()",
        "RewardDrawNotReady()",
        "UnsupportedDepositToken()",
        "ZeroAddress()",
    ]

    w3 = Web3() # No need for a provider if only using keccak

    for error_sig in common_errors:
        # Calculate the keccak256 hash of the error signature
        error_hash = w3.keccak(text=error_sig)
        # Get the first 4 bytes (the selector)
        calculated_selector = "0x" + error_hash.hex()[:8]

        if calculated_selector.lower() == selector.lower():
            return selector, error_sig

    return selector, "Unknown Error Signature"

# --- USAGE EXAMPLE ---
revert_data_from_your_output = "0x025dbdd4"
selector, error_name = decode_solidity_custom_error(revert_data_from_your_output)

if error_name != "Unknown Error Signature":
    print(f"Decoded Selector: {selector}")
    print(f"Corresponding Error: {error_name}")
else:
    print(f"Selector: {selector} - {error_name}")

print("\n--- Verification (Manually hashing 'InvalidReceiver()') ---")
w3 = Web3()
invalid_receiver_hash = w3.keccak(text="InvalidReceiver()")
print(f"keccak256('InvalidReceiver()'): {invalid_receiver_hash.hex()}")
print(f"First 4 bytes (selector): 0x{invalid_receiver_hash.hex()[:8]}")