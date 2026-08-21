#!/bin/bash
# Comprehensive driver-branching detection checks for ADR-0025

CONTROL_FILE=".program/audits/ROOT.7.3.7-verification/negative-control.ts"
TARGET_DIR="src"

echo "=========================================="
echo "ADR-0025 Driver-Branching Detection Checks"
echo "=========================================="
echo ""

# CHECK 1: instanceof LocalDriver/CloudDriver/ExecutionDriver
echo "=== CHECK 1: instanceof LocalDriver/CloudDriver/ExecutionDriver ==="
rg 'instanceof\s+(LocalDriver|CloudDriver|ExecutionDriver)' --type ts "$CONTROL_FILE" -n
echo "Check 1 exit code: $?"
echo ""

# CHECK 2: Quoted string literals (driver === "cloud"/'local')
echo "=== CHECK 2: Quoted driver literals (driver === \"cloud\"/\"local\") ==="
rg '(driver|driverType|driverKind)\s*[!=]==?\s*["\x27](cloud|local)["\x27]' --type ts "$CONTROL_FILE" -n
echo "Check 2 exit code: $?"
echo ""

# CHECK 3: Non-driver receivers (d.kind, driverKind, anything.kind where driver flows)
echo "=== CHECK 3: Non-driver receivers (d.kind, driverKind, .kind field access) ==="
rg '\b(d|driver|activeDriver|currentDriver|executionDriver)\.kind\b' --type ts "$CONTROL_FILE" -n
rg '\bdriverKind\b' --type ts "$CONTROL_FILE" -n
echo "Check 3 exit code: $?"
echo ""

# CHECK 4: constructor.name comparison
echo "=== CHECK 4: constructor.name comparison ==="
rg '(driver|execution).*\.constructor\.name' --type ts "$CONTROL_FILE" -n
echo "Check 4 exit code: $?"
echo ""

# CHECK 5: 'in' operator duck-typing on driver-only members
echo "=== CHECK 5: 'in' operator duck-typing (sandboxToken, cloudToken, etc.) ==="
rg '["\x27](sandboxToken|cloudToken|localPath|cloudEndpoint)["\x27]\s+in\s+' --type ts "$CONTROL_FILE" -n
echo "Check 5 exit code: $?"
echo ""

# CHECK 6: config.executionMode-style config flags
echo "=== CHECK 6: config.executionMode-style flags ==="
rg '\b(config|settings|options)\.executionMode\b' --type ts "$CONTROL_FILE" -n
echo "Check 6 exit code: $?"
echo ""

# CHECK 7: process.env EXECUTION_DRIVER (excluding EDITION per REQ-HE-01 s1)
echo "=== CHECK 7: process.env.EXECUTION_DRIVER (excluding legitimate EDITION) ==="
rg 'process\.env\.(EXECUTION_DRIVER|DRIVER_TYPE|NEXT_PUBLIC_DRIVER)' --type ts "$CONTROL_FILE" -n
echo "Check 7 exit code: $?"
echo ""

# CHECK 8: switch on driver.name or activeDriver.name
echo "=== CHECK 8: switch on driver.name ==="
rg 'switch\s*\([^)]*driver[^)]*\.name[^)]*\)' --type ts "$CONTROL_FILE" -n
echo "Check 8 exit code: $?"
echo ""

# CHECK 9: Ternary/conditional dynamic import() with driver
echo "=== CHECK 9: Conditional dynamic import() with driver ==="
rg 'import\s*\([^)]*\?[^)]*:[^)]*\)' --type ts "$CONTROL_FILE" -n
echo "Check 9 exit code: $?"
echo ""

# CHECK 10: driver.type field access (original pattern)
echo "=== CHECK 10: driver.type field access ==="
rg '\b(driver|execution).*\.type\b' --type ts "$CONTROL_FILE" -n
echo "Check 10 exit code: $?"
echo ""

echo "=========================================="
echo "NEGATIVE CONTROL COMPLETE"
echo "All 10 mechanisms should have hits above."
echo "=========================================="
