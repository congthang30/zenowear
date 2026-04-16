export default () => ({
  coupon: {
    restoreOnCancel:
      String(process.env.COUPON_RESTORE_ON_CANCEL ?? 'true').toLowerCase() !==
      'false',
  },
});
