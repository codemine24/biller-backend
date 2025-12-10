const clearOldOTPs = async () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  try {
    // const deletedOtps = await prisma.userOTP.deleteMany({
    //   where: {
    //     created_at: {
    //       lt: tenMinutesAgo,
    //     },
    //   },
    // });
    // console.log(`${deletedOtps.count} old OTPs deleted`);
  } catch (error) {
    console.error("Error deleting old OTPs:", error);
  }
};

export default clearOldOTPs;
