export enum TransactionErrorType {
    /// Not sufficient funds
    NotSufficientFunds = 0,
    /// Invalid amount
    InvalidAmount = 1,
    /// Invalid account/date or sales date in future
    InvalidAccountOrDateOrSalesDateInFuture = 2,
    /// CVV2 Declined
    CVV2Declined = 3,
    /// Invalid State Code
    InvalidStateCode = 4,
    /// Expired card
    ExpiredCard = 5,
    /// Restricted card
    RestrictedCard = 6,
    /// Not sufficient funds
    SuspectedFraud = 7,
    /// The card has expired. Get the new expiration date and try again
    TheCardHasExpired = 8,
    /// Non-numeric expiry
    NonNumericExpiry = 9,
    /// New Error
    NewError = 10,
    /// Repeat
    Repeat = 11,
    /// Restart Error
    RestartError = 12,
    Cancelled = 13
    // Error on card connect server
}
