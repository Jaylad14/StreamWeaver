const sendOtp = async (email, code) => {
  console.log('====================================');
  console.log(`Verification code for ${email}: ${code}`);
  console.log('Valid for 10 minutes');
  console.log('====================================');
};

module.exports = { sendOtp };
