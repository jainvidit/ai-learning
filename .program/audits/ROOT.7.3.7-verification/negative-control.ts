// Negative control file for ADR-0025 driver-branching detection
// All 10 branching mechanisms that MUST be caught by the grep checks

import { ExecutionDriver, LocalDriver, CloudDriver } from './types';

// MECHANISM 1: instanceof checks (bare identifiers)
function check1(driver: ExecutionDriver) {
  if (driver instanceof LocalDriver) {
    return 'local';
  }
  if (driver instanceof CloudDriver) {
    return 'cloud';
  }
}

// MECHANISM 2: Quoted string literals (driver value comparison)
function check2(driver: string) {
  if (driver === "cloud") {
    return 'cloud-mode';
  }
  if (driver === 'local') {
    return 'local-mode';
  }
}

// MECHANISM 3: Non-driver receiver (d.kind, driverKind, anything.kind where driver flows)
function check3(d: ExecutionDriver) {
  if (d.kind === 'local') {
    return 'local-via-kind';
  }
}

function check3b(driverKind: string) {
  if (driverKind === 'cloud') {
    return 'cloud-via-kind';
  }
}

// MECHANISM 4: constructor.name comparison
function check4(driver: ExecutionDriver) {
  if (driver.constructor.name === 'LocalDriver') {
    return 'local-via-constructor';
  }
}

// MECHANISM 5: 'in' operator duck-typing on driver-only members
function check5(driver: any) {
  if ('sandboxToken' in driver) {
    return 'cloud-via-duck-typing';
  }
}

// MECHANISM 6: config.executionMode-style config flags
function check6(config: any) {
  if (config.executionMode === 'local') {
    return 'local-via-config';
  }
}

// MECHANISM 7: process.env edition/driver vars (note: NEXT_PUBLIC_EDITION legitimate for edition deltas per REQ-HE-01 s1)
function check7() {
  if (process.env.EXECUTION_DRIVER === 'cloud') {
    return 'cloud-via-env';
  }
  // This one is LEGITIMATE for edition, not driver:
  // if (process.env.NEXT_PUBLIC_EDITION === 'hosted') { }
}

// MECHANISM 8: switch on .name
function check8(activeDriver: ExecutionDriver) {
  switch (activeDriver.name) {
    case 'local':
      return 'local-via-switch';
    case 'cloud':
      return 'cloud-via-switch';
  }
}

// MECHANISM 9: Ternary/conditional dynamic import()
async function check9(driverType: string) {
  const module = await import(driverType === 'cloud' ? './cloud' : './local');
  return module;
}

// MECHANISM 10: driver.type field access (already in gen0 pattern)
function check10(driver: ExecutionDriver) {
  if (driver.type === 'local') {
    return 'local-via-type';
  }
}
