import Claim from "../models/claimModel.js";

class ClaimRepository {
  async findByOrganisation(organisation, filter = {}) {
    return await Claim.find({ organisation, ...filter }).sort({ createdAt: -1 });
  }

  async create(data) {
    return await Claim.create(data);
  }

  async findById(id) {
    return await Claim.findById(id);
  }

  async updateStatus(id, status, rejectionReason = null) {
    const update = { status };
    if (rejectionReason) update.rejectionReason = rejectionReason;
    return await Claim.findByIdAndUpdate(id, update, { new: true });
  }

  async getSummary(organisation) {
    const pendingClaims = await Claim.find({ organisation, status: "pending" });
    const pendingCount = pendingClaims.length;
    const totalAmount = pendingClaims.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalAmountFormatted = totalAmount >= 1000 ? `₹${(totalAmount / 1000).toFixed(1)}k` : `₹${totalAmount}`;

    return {
      pendingCount,
      totalAmount,
      totalAmountFormatted,
    };
  }
}

export default new ClaimRepository();
