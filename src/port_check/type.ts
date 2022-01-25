/**
 * Enum to represent the expected outcome of a `PortCheck`
 */
export enum ExpectedResult {
  OPEN,
  CLOSED
}

/**
 * Enum to represent the actual outcome of a `PortCheck`
 */
export enum RunResult {
  EXPECTED,
  EXPECTED_OPEN_BUT_NO_RESPONSE,
  EXPECTED_CLOSED_BUT_OPEN,
  ERROR
}

/**
 * This function converts the expected outcome from enum to string for metrics building.
 * @param input The expected result as enum
 * @returns a string representing the outcome
 */
export const getExpectedAsString = (input: ExpectedResult): string => {
  return input === ExpectedResult.OPEN ? 'open' : 'closed';
};
