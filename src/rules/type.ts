/**
 * Enum to determine the scope of a firewall rule
 */
export enum RuleType {
  GLOBAL,
  GROUP,
  HOST
}

/**
 * Enum to determine the protocol a firewall rule is used for 
 */
export enum Protocol {
  TCP,
  UDP
}

/**
 * This function returns the enum instance matching the protocol provided via the parameter `proto`
 * @param proto a string representing a protocol
 * @returns the matching `Protocol` instance
 */
export const getProtocol = (proto: string): Protocol => {
  switch (proto.toLowerCase().trim()) {
    case 'tcp':
      return Protocol.TCP;
    case 'udp':
      return Protocol.UDP;
    default:
      return Protocol.TCP;
  }
};
