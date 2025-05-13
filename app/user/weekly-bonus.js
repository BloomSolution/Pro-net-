const BinaryBonusStatus = require('../models/binary-bonus-status');
const wallet = require('../models/user-wallet-model');
const cron = require('node-cron');

//calculate Weekly Binary Bonus START
exports.calculateWeeklyBinaryBonus = async function (userId) {
  const userStatus = await BinaryBonusStatus.findOne({ user: userId });
  if (!userStatus) return 0;

  const PV = 42;
  const BONUS_PERCENTAGE = 0.10;

  const totalLeft = (userStatus.leftActive || 0) + (userStatus.leftCarry || 0);
  const totalRight = (userStatus.rightActive || 0) + (userStatus.rightCarry || 0);
  const matched = Math.min(totalLeft, totalRight);
  const bonus = matched * PV * BONUS_PERCENTAGE;

  // Update user's wallet
  await wallet.findOneAndUpdate(
    { user: userId },
    { $inc: { binaryBonus: bonus } },
    { upsert: true }
  );

  // Update BinaryBonusStatus with new carry and reset weekly active counts
  await BinaryBonusStatus.updateOne(
    { user: userId },
    {
      leftCarry: totalLeft - matched,
      rightCarry: totalRight - matched,
      leftActive: 0,
      rightActive: 0,
      lastBonusDate: new Date()
    }
  );

  return bonus;
};

// Schedule weekly job - every Saturday at 12:00 PM
cron.schedule('0 12 * * 6', async () => {
  try {
    console.log('⏳ Weekly Binary Bonus Job Started (Saturday 12 PM)');

    const allUsers = await BinaryBonusStatus.find();

    for (const userStatus of allUsers) {
      const bonus = await exports.calculateWeeklyBinaryBonus(userStatus.user);
      console.log(`✅  Processed bonus for user ${userStatus.user}: $${bonus}`);
    }
    console.log('🎉 Weekly Binary Bonus Job Completed');
  } catch (error) {
    console.error('❌ Error running weekly bonus job:', error.message);
  }
});
//calculate Weekly Binary Bonus END
