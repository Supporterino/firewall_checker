export enum ExpectedResult {
  OPEN,
  CLOSED
}

export enum RunResult {
  EXPECTED,
  EXPECTED_OPEN_BUT_NO_RESPONSE,
  EXPECTED_CLOSED_BUT_OPEN,
  ERROR
}
