const bcrypt = require('bcryptjs');

const PasswordUtil = {
  async hashPassword(plain) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
  },
  async compare(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }
};

module.exports = PasswordUtil;
