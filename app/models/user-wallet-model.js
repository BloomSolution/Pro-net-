const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'usermaster' },
  wallet_type: { type: String, enum: ['bank', 'crypto'], required: true },

  // Bank fields
  account_holder_name: String,
  bank_name: String,
  account_number: String,
  ifsc_code: String,

  // Crypto fields
  crypto_address: String,
  crypto_network: String,  // e.g., TRC20, ERC20, BEP20
  crypto_type: String,     // e.g., USDT, BTC, ETH

}, { timestamps: true });

module.exports = mongoose.model('wallet', walletSchema, 'wallets');

