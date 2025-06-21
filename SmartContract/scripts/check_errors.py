import hashlib

def get_error_selector(error_signature):
    return '0x' + hashlib.sha3_256(error_signature.encode()).hexdigest()[:8]

errors = [
    "AavePoolUnavailable()",
    "InsufficientBalance()",
    "InsufficientParticipants()",
    "InsufficientRewardFunds()",
    "InvalidPriceFeed()",
    "InvalidSlippage()",
    "InvalidStrategy()",
    "InvalidVRFRequest()",
    "OperationInProgress()",
    "OwnableInvalidOwner(address)",
    "OwnableUnauthorizedAccount(address)",
    "Paused()",
    "PriceManipulationDetected()",
    "RebalanceNotNeeded()",
    "ReentrancyGuardReentrantCall()",
    "RewardDrawNotReady()",
    "UnauthorizedCaller()",
    "UnsupportedDepositToken()",
    "ZeroAddress()",
    "ZeroAmount()"
]

print("--- Custom Error Selectors ---")
for error in errors:
    selector = get_error_selector(error)
    print(f"{error}: {selector}")

print("\nLooking for specific hash: 0x789ed35c")
target_hash = "0x789ed35c"
found = False
for error in errors:
    selector = get_error_selector(error)
    if selector == target_hash:
        print(f"MATCH FOUND: {error}: {selector}")
        found = True
        break
if not found:
    print(f"No direct match for {target_hash} in the known custom errors.")
print("----------------------------")