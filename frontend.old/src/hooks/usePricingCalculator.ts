export function usePricingCalculator() {
  const calculateCardCost = (
    length: number,
    width: number,
    gsm: number,
    quantity: number,
    ups: number,
    pricePerKg: number,
    conversionPercent: number = 0,
  ) => {
    if (!length || !width || !gsm || !quantity || !ups || !pricePerKg) {
      return null;
    }

    // Weight of 1 packet (100 sheets)
    const packetWeight = (length * width * gsm) / 15500;

    // Total ups (100 sheets per packet)
    const totalUpsPerPacket = ups * 100;

    // Number of packets required
    const totalPackets = quantity / totalUpsPerPacket;

    // Total cost of card
    let totalCost = totalPackets * packetWeight * pricePerKg;

    // Apply conversion percentage if provided
    if (conversionPercent > 0) {
      totalCost = totalCost * (1 + conversionPercent / 100);
    }

    // Cost per unit
    const costPerUnit = totalCost / quantity;

    return {
      packetWeight: parseFloat(packetWeight.toFixed(4)),
      totalPackets: parseFloat(totalPackets.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      costPerUnit: parseFloat(costPerUnit.toFixed(4)),
    };
  };

  const calculatePaperCost = (
    length: number,
    width: number,
    gsm: number,
    quantity: number,
    ups: number,
    pricePerKg: number,
    conversionPercent: number = 0,
  ) => {
    if (!length || !width || !gsm || !quantity || !ups || !pricePerKg) {
      return null;
    }

    // Weight of 1 ream (500 sheets)
    const reamWeight = (length * width * gsm) / 3100;

    // Total ups (500 sheets per ream)
    const totalUpsPerReem = ups * 500;

    // Number of reams required
    const totalReams = quantity / totalUpsPerReem;

    // Total cost of paper
    let totalCost = totalReams * reamWeight * pricePerKg;

    // Apply conversion percentage if provided
    if (conversionPercent > 0) {
      totalCost = totalCost * (1 + conversionPercent / 100);
    }

    // Cost per unit
    const costPerUnit = totalCost / quantity;

    return {
      reamWeight: parseFloat(reamWeight.toFixed(4)),
      totalReams: parseFloat(totalReams.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      costPerUnit: parseFloat(costPerUnit.toFixed(4)),
    };
  };

  return { calculateCardCost, calculatePaperCost };
}
