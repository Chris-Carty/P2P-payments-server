CREATE DATABASE IF NOT EXISTS `RVNU_Database`;
USE `RVNU_Database`;


CREATE TABLE `RvnuAccount` (
  `AccountID` varchar(36) NOT NULL,
  `FirstName` varchar(20),
  `LastName` varchar(20),
  `MobileNumber` varchar(20),
  `Email` varchar(30),
  `Password` varchar(20),
  `SortCode` varchar(6),
  `AccountNumber` varchar(8),
  `Tl_providerId` varchar(50),
  `RvnuCodeID` varchar(36),
  `TotalAssetsPaid` Double,
  `TotalAssetsOwed` Double,
  `TotalAssets` Double,
  `AccountCreated` DateTime,
  PRIMARY KEY (`AccountID`),
  UNIQUE KEY UniqueMobileNumber (MobileNumber),
  UNIQUE KEY UniqueEmail (email),
  UNIQUE KEY RvnuCodeID (RvnuCodeID)
);


INSERT INTO `RvnuAccount` (`AccountID`, `FirstName`, `LastName`, `MobileNumber`, `Email`, `Password`, `SortCode`, `AccountNumber`, `Tl_providerId`, `RvnuCodeID`, `TotalAssetsPaid`,  `TotalAssetsOwed`, `TotalAssets`, `AccountCreated`) VALUES
	('5548b45b-5580-41be-bad6-b8b1098d3d7d', 'Chris', 'Carty', '+447527943282', 'chris@rvnu.world', 'pass123', '123456', '12345678', 'ob-monzo', 'ea0f16f6-9302-4ad1-87f5-a174133ec425', 00.00, 00.00, 00.00, '2022-06-01 22:42:00'),
  ('85f13fd6-bd1d-4272-8256-ec521eec091c', 'Jack', 'Hayden', '+447487811150', 'jack@rvnu.world', 'pass123', '123456', '12345678', 'ob-natwest', 'ce19e022-6bcb-4e16-8b85-e47884aa62ed', 00.00, 00.00, 00.00, '2022-06-01 22:42:00'),
  ('36f1bef5-1a21-45ba-84ba-4f82911d1ee5', 'Colette', 'Slater-Barrass', '+447508259020', 'colette.sb@hotmail.co.uk', 'pass123', '123456', '12345678', 'ob-natwest', NULL, 00.00, 00.00, 00.00, '2022-06-01 22:42:00'),
  ('3a88145b-7113-4c68-8bc5-dd5fad9546f3', 'Hassan', 'Sharif', '+447833468832', 'hassan_sharif@hotmail.co.uk', 'pass123', '123456', '12345678', 'ob-revolut', '468fdb04-76c7-41fd-8d9b-8a15b642e770', 00.00, 00.00, 00.00, '2022-06-01 22:42:00');


CREATE TABLE `RvnuCode` (
  `RvnuCodeID` varchar(36) NOT NULL,
  `RvnuCode` varchar(6),
  `DateGenerated` DateTime,
  `Expiry` DateTime,
  PRIMARY KEY (`RvnuCodeID`),
  UNIQUE KEY RvnuCode (RvnuCode)
);

INSERT INTO `RvnuCode` (`RvnuCodeID`, `RvnuCode`, `DateGenerated`, `Expiry`) VALUES
	('ce19e022-6bcb-4e16-8b85-e47884aa62ed', 'qwert1', '2022-06-01 22:42:00', '2022-08-19 22:42:00'),
  ('ea0f16f6-9302-4ad1-87f5-a174133ec425', 'cg56u8', '2022-06-01 22:42:00', '2022-08-23 22:42:00'),
  ('468fdb04-76c7-41fd-8d9b-8a15b642e770', '864c10', '2022-07-20 14:44:10', '2022-08-20 14:44:10');


CREATE TABLE `Merchant` (
  `MerchantID` varchar(36),
  `MerchantName` varchar(20),
  `Email` varchar(20),
  `Password` varchar(20),
  `MinimumSpend` Double,
  `CommissionPercentage` Double,
  `AccountNumber` varchar(8),
  `SortCode` varchar(6),
  `Tl_providerId` varchar(50),
  `AccountCreated` DateTime,
  PRIMARY KEY (`MerchantID`),
  UNIQUE KEY MerchantName (MerchantName),
  UNIQUE KEY MerchantEmail (Email)
);

INSERT INTO `Merchant` (`MerchantID`, `MerchantName`, `Email`, `Password`, `MinimumSpend`, `CommissionPercentage`, `AccountNumber`, `SortCode`, `Tl_providerId`, `AccountCreated`) VALUES
	('41784630-695b-4003-9588-89b322b59ac2', 'ASOS', 'asos@info.com', 'pass123', 50.00, 5.00, '12345678', '123456', 'ob-natwest', '2022-06-30 22:42:00');


CREATE TABLE `RvnuTransaction` (
  `PaymentID` varchar(36),
  `MerchantID` varchar(36),
  `AccountID` varchar(36),
  `RemitterProviderID` varchar(36),
  `DateTime` DateTime,
  `Currency` varchar(3),
  `TotalAmount` Double,
  `RvnuCodeID` varchar(36),
  `RvnuFee` Double,
  `UserCommission` Double,
  `Reference` varchar(36),
  `Status` varchar(20),
  `EventID` varchar(36),
  `Webhook_Datetime` varchar(25),
  `Webhook_Description` varchar(20),
  PRIMARY KEY (`PaymentID`)
);


CREATE TABLE `RvnuAccountPayout` (
  `PayoutID` varchar(36),
  `AccountID` varchar(36),
  `TotalAmount` Double,
  `DateTime` DateTime,
  PRIMARY KEY (`PayoutID`)
);


CREATE TABLE `Invoice` (
  `InvoiceID` varchar(36),
  `MerchantID` varchar(36),
  `TotalAmount` Double,
  `DateTime` DateTime,
  `DueDate` DateTime,
  PRIMARY KEY (`InvoiceID`)
);

CREATE TABLE `ExpiredRvnuCode` (
  `RvnuCodeID` varchar(36),
  `RvnuCode` varchar(6),
  `DateGenerated` DateTime,
  `DateExpired` DateTime,
  `AccountID` varchar(36)
);
