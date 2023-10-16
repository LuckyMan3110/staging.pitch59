export enum BankAccountStatus {
  /// status description :
  // new 			    -> A bank account that hasn’t had any activity or validation performed is new
  // validated 		-> If Stripe can determine that the bank account exists, its status will be validated
  // verified 		-> If customer bank account verification has succeeded, the bank account status will be verified
  // verification_failed -> If the verification failed for any reason, such as microdeposit failure, the status
  //                        will be verification_failed
  // errored 		    ->  If a transfer sent to this bank account fails, we’ll set the status to
  //                      errored and will not continue to send transfers until the bank details are updated.
  ///

  Pending = 1,
  Validated = 2,
  Verified = 3,
  Verification_failed = 4,
  Errored = 5
}
