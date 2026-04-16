export default () => ({
  momo: {
    apiUrl: process.env.MOMO_API_URL ?? '',
    secretKey: process.env.MOMO_SECRET_KEY ?? '',
    accessKey: process.env.MOMO_ACCESS_KEY ?? '',
    partnerCode: process.env.MOMO_PARTNER_CODE ?? 'MOMO',
    requestType: process.env.MOMO_REQUEST_TYPE ?? 'captureWallet',
  },
});
