
CREATE TABLE RvnuAccount
(
 AccountID varchar(36) NOT NULL PRIMARY KEY,
 FirstName varchar(50) DEFAULT NULL,
 LastName varchar(50) DEFAULT NULL,
 DoB varchar(10) DEFAULT NULL,
 MobileNumber varchar(50) NOT NULL,
 Username varchar(15) DEFAULT NULL,
 Email varchar(50) DEFAULT NULL,
 Password varchar(150) DEFAULT NULL,
 AccountName varchar(70) DEFAULT NULL,
 SortCode varchar(150) DEFAULT NULL,
 AccountNumber varchar(150) DEFAULT NULL,
 iban varchar(150) DEFAULT NULL,
 Tl_providerId varchar(50) DEFAULT NULL,
 RvnuCodeID varchar(36) DEFAULT NULL,
 TotalAssetsPaid decimal(10,2) DEFAULT 0.00,
 TotalAssetsOwed decimal(10,2) DEFAULT 0.00,
 TotalAssets decimal(10,2) DEFAULT 0.00,
 AccountCreated datetime NOT NULL,
 CONSTRAINT AK_MobileNumber UNIQUE(MobileNumber),
 CONSTRAINT AK_Username UNIQUE(Username),
 CONSTRAINT AK_Email UNIQUE(Email)     
);

-- Insert rows into table 'RvnuAccount'
INSERT INTO RvnuAccount
 (AccountID, FirstName, LastName, MobileNumber, Username, RvnuCodeID, AccountCreated)
VALUES
 ('5548b45b-5580-41be-bad6-b8b1098d3d7d', 'Chris', 'Carty', '+447527943282', 'chris', 'ea0f16f6-9302-4ad1-87f5-a174133ec425', '2022-06-01 22:42:00'),

 ('85f13fd6-bd1d-4272-8256-ec521eec091c', 'Jack', 'Hayden','+447487811150', 'jack', NULL, '2022-06-01 22:42:00'),

 ('36f1bef5-1a21-45ba-84ba-4f82911d1ee5', 'Colette', 'Slater-Barrass','+447508259020', 'colly', 'ce19e022-6bcb-4e16-8b85-e47884aa62ed', '2022-06-01 22:42:00'),

 ('3a88145b-7113-4c68-8bc5-dd5fad9546f3', 'Hassan', 'Sharif','+447833468832', 'hassan', '468fdb04-76c7-41fd-8d9b-8a15b642e770', '2022-06-01 22:42:00');

-- Create the table in the specified schema
CREATE TABLE RvnuCode
(
 RvnuCodeID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 DateGenerated datetime NOT NULL,
 Expiry datetime NOT NULL 
);

INSERT INTO RvnuCode
 (RvnuCodeID, DateGenerated, Expiry)
VALUES
 ('ce19e022-6bcb-4e16-8b85-e47884aa62ed', '2022-06-01 22:42:00', '2022-08-19 22:42:00'),
 ('ea0f16f6-9302-4ad1-87f5-a174133ec425', '2022-06-01 22:42:00', '2022-08-23 22:42:00'),
 ('468fdb04-76c7-41fd-8d9b-8a15b642e770', '2022-07-20 14:44:10', '2022-08-20 14:44:10');

CREATE TABLE ExpiredRvnuCode
(
 ExpiredRvnuCodeID varchar(36) NOT NULL PRIMARY KEY,
 DateGenerated datetime NOT NULL,
 Expiry datetime NOT NULL,
 AccountID varchar(36) NOT NULL     
);

CREATE TABLE RvnuMerchant
(
 MerchantID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 MerchantName varchar(20) NOT NULL,
 Email varchar(50) NOT NULL,
 Password varchar(150) NOT NULL,
 MinimumSpend decimal(10,2) NOT NULL,
 CommissionPercentage decimal(10,2) NOT NULL,
 iBan varchar(34) NOT NULL,
 SortCode varchar(6) NOT NULL,
 AccountNumber varchar(8) NOT NULL,
 Tl_providerId varchar(50) NOT NULL,
 RedirectUri varchar(400) NOT NULL,
 AccountCreated datetime NOT NULL,
 CONSTRAINT AK_MerchantName UNIQUE(MerchantName), 
 CONSTRAINT AK_MerchantEmail UNIQUE(Email),
 CONSTRAINT AK_iBan UNIQUE(iBan)          
);

INSERT INTO RvnuMerchant
 (MerchantID, MerchantName, Email, Password, MinimumSpend, CommissionPercentage, iBan, SortCode, AccountNumber, Tl_providerId, RedirectUri, AccountCreated)
VALUES
 ('41784630-695b-4003-9588-89b322b59ac2', 'ASOS', 'asos@info.com', 'pass123', 5.00, 5.00, 'GB53REVO00997042945193','040075', '91577926', 'ob-revolut', 'http://localhost:3000/pay?client_id=41784630-695b-4003-9588-89b322b59ac2&payment_request_id=41784630-695b-4003-9588-89b322b59ac2&redirect_uri=https://demo.tink.com/donate/callback','2022-12-23 10:00:00');


CREATE TABLE RvnuSession
(
 SessionID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 ClientID varchar(36) NOT NULL,
 MobileNumber varchar(50) DEFAULT NULL,
 Verified tinyint(1) DEFAULT 0,
 AccountID varchar(36) NOT NULL,
 NewUser tinyint(1) DEFAULT 0,
 RecommenderID varchar(36) DEFAULT NULL,
 RvnuPaymentID varchar(36) NOT NULL,
 RecommenderAssetsUpdated tinyint(1) DEFAULT 0,
 SessionStart datetime NOT NULL,
 SessionTimeout datetime NOT NULL,
 RvnuFlowSuccess tinyint(1) DEFAULT 0,
 RvnuFlowDescription varchar(100) DEFAULT NULL
);

--TODO Generate TrueLayerPaymentID when this request is made by the client. 
CREATE TABLE RvnuPayment
(
 RvnuPaymentID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 ClientID varchar(36) NOT NULL,
 PayerName varchar(36) NOT NULL,
 Currency varchar(3) NOT NULL,
 TotalAmount decimal(10,2) NOT NULL,
 RvnuFee decimal(10,2) NOT NULL,
 Commission decimal(10,2) NOT NULL,
 Reference varchar(36) NOT NULL,
 RequestedAt datetime NOT NULL,
 PaymentTimeout datetime NOT NULL,
 TrueLayerPaymentID varchar(36) DEFAULT NULL,
 WebhookStatus varchar(20) DEFAULT NULL,
 WebhookEventID varchar(36) DEFAULT NULL,
 WebhookDatetime varchar(25) DEFAULT NULL,
 WebhookDescription varchar(20) DEFAULT NULL
);

INSERT INTO RvnuPayment
 (RvnuPaymentID, ClientID, PayerName, Currency, TotalAmount, RvnuFee, Commission, Reference, RequestedAt, PaymentTimeout)
VALUES
 ('4310626d-9c91-434d-ab69-cfa7598178be', '94ff854c-5015-4f15-9ff5-43106b4d0b7a', 'Chris Carty', 'GBP', 2.50, 0.10, 0.25, 'GB-TEST-123','2022-12-27 10:00:00', '2022-12-27 10:30:00');


CREATE TABLE RvnuApp
(
 RvnuAppID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 MerchantID varchar(36) NOT NULL,
 ClientID varchar(36) NOT NULL,
 ClientSecret varchar(36) NOT NULL,
 Scopes varchar(500) NOT NULL,
 CreatedAt datetime NOT NULL,
 isVerified tinyint(1) DEFAULT 0
);

INSERT INTO RvnuApp
 (RvnuAppID, MerchantID, ClientID, ClientSecret, Scopes, CreatedAt)
VALUES
 ('7ad88820-28da-4541-a3f7-46cdb67897df', '41784630-695b-4003-9588-89b322b59ac2', '94ff854c-5015-4f15-9ff5-43106b4d0b7a', 'c9c86a68-ee7b-4471-8bf2-5e2cc4086e61', 'payment:read,payment:write', '2022-12-27 10:00:00');


CREATE TABLE RvnuBusinessAccountPayout
(
 PayoutID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 TotalAmount decimal(10,2) NOT NULL, 
 DateTime datetime NOT NULL
);

CREATE TABLE RvnuMerchantPayout
(
 PayoutID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 AccountID varchar(36) NOT NULL,
 TotalAmount decimal(10,2) NOT NULL, 
 DateTime datetime NOT NULL
);

CREATE TABLE RvnuCommissionPayout
(
 PayoutID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 AccountID varchar(36) NOT NULL,
 TotalAmount decimal(10,2) NOT NULL, 
 Reference varchar(18) NOT NULL,
 TrueLayerPaymentId varchar(36) NOT NULL,
 ExecutedAt datetime DEFAULT NULL
);

