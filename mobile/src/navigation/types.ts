export type SellerStackParamList = {
  PhoneEntry: undefined;
  OtpVerify: { phone: string; devOtp?: string };
  ProfileSetup: undefined;
  Dashboard: undefined;
  AddListing: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Sell: undefined;
};
