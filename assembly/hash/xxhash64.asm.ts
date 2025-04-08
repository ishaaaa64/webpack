const Prime1: u64 = 11400714785074694791;
const Prime2: u64 = 14029467366897019727;
const Prime3: u64 = 1609587929392839161;
const Prime4: u64 = 9650029242287828579;
const Prime5: u64 = 2870177450012600261;

let state0: u64;
let state1: u64;
let state2: u64;
let state3: u64;
let totalLength: u64;

function processSingle(previous: u64, input: u64): u64 {
  return rotl(previous + input * Prime2, 31) * Prime1;
}

export function init(): void {
  state0 = Prime1 + Prime2;
  state1 = Prime2;
  state2 = 0;
  state3 = <u64>(-Prime1);
  totalLength = 0;
}

export function update(input: Uint8Array): void {
  let length = input.length;
  if (length == 0) return;

  totalLength += length;

  let s0 = state0;
  let s1 = state1;
  let s2 = state2;
  let s3 = state3;

  let i = 0;
  while (i + 32 <= length) {
    s0 = processSingle(s0, readU64(input, i));
    s1 = processSingle(s1, readU64(input, i + 8));
    s2 = processSingle(s2, readU64(input, i + 16));
    s3 = processSingle(s3, readU64(input, i + 24));
    i += 32;
  }

  state0 = s0;
  state1 = s1;
  state2 = s2;
  state3 = s3;
}

export function final(input: Uint8Array): u64 {
  let length = input.length;
  let result: u64;

  if (totalLength > 0) {
    result = rotl(state0, 1) + rotl(state1, 7) + rotl(state2, 12) + rotl(state3, 18);
    result = (result ^ processSingle(0, state0)) * Prime1 + Prime4;
    result = (result ^ processSingle(0, state1)) * Prime1 + Prime4;
    result = (result ^ processSingle(0, state2)) * Prime1 + Prime4;
    result = (result ^ processSingle(0, state3)) * Prime1 + Prime4;
  } else {
    result = Prime5;
  }

  result += totalLength + length;

  let i = 0;

  while (i + 8 <= length) {
    result = rotl(result ^ processSingle(0, readU64(input, i)), 27) * Prime1 + Prime4;
    i += 8;
  }

  if (i + 4 <= length) {
    result = rotl(result ^ (<u64>readU32(input, i) * Prime1), 23) * Prime2 + Prime3;
    i += 4;
  }

  while (i < length) {
    result = rotl(result ^ (<u64>input[i] * Prime5), 11) * Prime1;
    i++;
  }

  // Final mixing
  result ^= result >> 33;
  result *= Prime2;
  result ^= result >> 29;
  result *= Prime3;
  result ^= result >> 32;

  return result;
}

// Helper functions for reading from Uint8Array
function readU64(input: Uint8Array, offset: i32): u64 {
  return (
    (<u64>input[offset]) |
    (<u64>input[offset + 1] << 8) |
    (<u64>input[offset + 2] << 16) |
    (<u64>input[offset + 3] << 24) |
    (<u64>input[offset + 4] << 32) |
    (<u64>input[offset + 5] << 40) |
    (<u64>input[offset + 6] << 48) |
    (<u64>input[offset + 7] << 56)
  );
}

function readU32(input: Uint8Array, offset: i32): u32 {
  return (
    (<u32>input[offset]) |
    (<u32>input[offset + 1] << 8) |
    (<u32>input[offset + 2] << 16) |
    (<u32>input[offset + 3] << 24)
  );
}
