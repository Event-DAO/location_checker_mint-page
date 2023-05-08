
export function shortenAddress (address, chars = 4) {
    try {
      const parsed = address;
      return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
    } catch (error) {
      throw Error(`Invalid 'address' parameter '${address}'.`);
    }
}

