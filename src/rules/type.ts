export enum RuleType {
  GLOBAL,
  GROUP,
  HOST
}

export enum Protocol {
  TCP,
  UDP
}

export const getProtocol = (proto: string): Protocol => {
  switch (proto.toLowerCase().trim()) {
    case 'tcp':
      return Protocol.TCP
    case 'udp':
      return Protocol.UDP
    default:
      return Protocol.TCP
  }
}
