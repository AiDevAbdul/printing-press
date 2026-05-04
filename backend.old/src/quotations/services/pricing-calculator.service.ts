import { Injectable } from '@nestjs/common';

export interface CardCostResult {
  packetWeight: number;
  totalPackets: number;
  totalCost: number;
  costPerUnit: number;
}

export interface PaperCostResult {
  reamWeight: number;
  totalReams: number;
  totalCost: number;
  costPerUnit: number;
}

export interface FixedCharges {
  ctp?: number;
  spot_uv?: number;
  plain_uv?: number;
  drip_off_uv?: number;
  metalize?: number;
  emboss?: number;
  lamination?: number;
  others?: number;
}

@Injectable()
export class PricingCalculatorService {
  /**
   * Calculate card/sticker cost using formula:
   * Weight = Length * Width * GSM / 15500 = 1 Packet Weight (kg)
   * 1 pack = 100 Sheets
   * Ups * 100 Sheets = total ups
   * Total Quantity required / number of ups(input) = number of Packet Required
   * Packet required * 1 Packet Weight (kg) * price per kg(input) = total cost of card/sticker
   * Total cost of card / number of ups(input) = cost of card per unit
   */
  calculateCardCost(
    length: number,
    width: number,
    gsm: number,
    quantity: number,
    ups: number,
    pricePerKg: number,
    conversionPercent: number = 0,
  ): CardCostResult {
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
      packetWeight,
      totalPackets,
      totalCost,
      costPerUnit,
    };
  }

  /**
   * Calculate paper cost using formula:
   * Weight = Length * Width * GSM / 3100 = 1 Ream Weight (kg)
   * 1 Ream = 500 Sheets
   * Ups * 500 Sheets = number of ups
   * Total Quantity required / number of ups(input) = number of Reams Required
   * Ream required * weight per Ream * price per kg(input) = total cost of paper
   * Total cost of Paper / number of ups(input) = cost of paper per unit
   */
  calculatePaperCost(
    length: number,
    width: number,
    gsm: number,
    quantity: number,
    ups: number,
    pricePerKg: number,
    conversionPercent: number = 0,
  ): PaperCostResult {
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
      reamWeight,
      totalReams,
      totalCost,
      costPerUnit,
    };
  }

  /**
   * Calculate total fixed charges
   */
  calculateFixedCharges(charges: FixedCharges): number {
    return (
      (charges.ctp || 0) +
      (charges.spot_uv || 0) +
      (charges.plain_uv || 0) +
      (charges.drip_off_uv || 0) +
      (charges.metalize || 0) +
      (charges.emboss || 0) +
      (charges.lamination || 0) +
      (charges.others || 0)
    );
  }

  /**
   * Calculate total pricing with all components
   */
  calculateTotalPricing(
    materialCost: number,
    printingCost: number,
    finishingCost: number,
    prePressCost: number,
    fixedCharges: number,
    profitMarginPercent: number,
    discountPercent: number,
    taxPercent: number,
  ): {
    overhead: number;
    subtotal: number;
    profitMargin: number;
    discount: number;
    tax: number;
    total: number;
  } {
    // Calculate overhead (15% of material + printing + finishing + pre-press)
    const overhead = (materialCost + printingCost + finishingCost + prePressCost) * 0.15;

    // Subtotal
    const subtotal =
      materialCost +
      printingCost +
      finishingCost +
      prePressCost +
      overhead +
      fixedCharges;

    // Profit margin
    const profitMargin = (subtotal * profitMarginPercent) / 100;

    // Subtotal with profit
    const subtotalWithProfit = subtotal + profitMargin;

    // Discount
    const discount = (subtotalWithProfit * discountPercent) / 100;

    // Subtotal after discount
    const subtotalAfterDiscount = subtotalWithProfit - discount;

    // Tax
    const tax = (subtotalAfterDiscount * taxPercent) / 100;

    // Total
    const total = subtotalAfterDiscount + tax;

    return {
      overhead,
      subtotal,
      profitMargin,
      discount,
      tax,
      total,
    };
  }
}
