export default () => ({
  vnpay: {
    tmnCode: process.env.VPAY_TMN_CODE ?? '',
    hashSecret: process.env.VPAY_HASH_SECRET ?? '',
    paymentUrl: process.env.VPAY_BASE_URL ?? '',
    command: process.env.VPAY_COMMAND ?? 'pay',
    currCode: process.env.VPAY_CURR_CODE ?? 'VND',
    version: process.env.VPAY_VERSION ?? '2.1.0',
    locale: process.env.VPAY_LOCALE ?? 'vn',
  },
});
