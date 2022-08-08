-- RESOURCES:

-- https://docs.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql?view=sql-server-ver16

-- https://docs.microsoft.com/en-us/sql/azure-data-studio/quickstart-sql-server?view=sql-server-ver16

-- Create a new table called 'RvnuAccount' in schema 'dbo'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.RvnuAccount', 'U') IS NOT NULL
 DROP TABLE dbo.RvnuAccount;
GO
-- Create the table in the specified schema
CREATE TABLE dbo.RvnuAccount
(
 AccountID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 FirstName varchar(50) NOT NULL,
 LastName varchar(50) NOT NULL,
 MobileNumber varchar(50) NOT NULL,
 Email varchar(50) NOT NULL,
 Password varchar(50) NOT NULL,
 SortCode varchar(6) NOT NULL,
 AccountNumber varchar(8) NOT NULL,
 Tl_providerId varchar(50) NOT NULL,
 RvnuCodeID varchar(36) DEFAULT NULL,
 TotalAssetsPaid decimal(10,2),
 TotalAssetsOwed decimal(10,2),
 TotalAssets decimal(10,2),
 AccountCreated datetime NOT NULL,
 CONSTRAINT AK_MobileNumber UNIQUE(MobileNumber),
 CONSTRAINT AK_Email UNIQUE(Email),
 CONSTRAINT AK_RvnuCodeID UNIQUE(RvnuCodeID)        
);
GO

-- Insert rows into table 'RvnuAccount'
INSERT INTO dbo.RvnuAccount
 ([AccountID], [FirstName], [LastName], [MobileNumber], [Email], [Password], [SortCode], [AccountNumber], [Tl_providerId], [RvnuCodeID], [TotalAssetsPaid], [TotalAssetsOwed], [TotalAssets], [AccountCreated])
VALUES
 ('5548b45b-5580-41be-bad6-b8b1098d3d7d', 'Chris', 'Carty', '+447527943282', 'chris@rvnu.world', 'pass123', '123456', '12345678', 'ob-monzo', 'ea0f16f6-9302-4ad1-87f5-a174133ec425', 00.00, 00.00, 00.00, '2022-06-01 22:42:00'),
 ('85f13fd6-bd1d-4272-8256-ec521eec091c', 'Jack', 'Hayden', '+447487811150', 'jack@rvnu.world', 'pass123', '123456', '12345678', 'ob-natwest', NULL, 00.00, 00.00, 00.00, '2022-06-01 22:42:00'),
 ('36f1bef5-1a21-45ba-84ba-4f82911d1ee5', 'Colette', 'Slater-Barrass', '+447508259020', 'colette.sb@hotmail.co.uk', 'pass123', '123456', '12345678', 'ob-natwest', 'ce19e022-6bcb-4e16-8b85-e47884aa62ed', 00.00, 00.00, 00.00, '2022-06-01 22:42:00'),
 ('3a88145b-7113-4c68-8bc5-dd5fad9546f3', 'Hassan', 'Sharif', '+447833468832', 'hassan_sharif@hotmail.co.uk', 'pass123', '123456', '12345678', 'ob-revolut', '468fdb04-76c7-41fd-8d9b-8a15b642e770', 00.00, 00.00, 00.00, '2022-06-01 22:42:00');
GO


-- Create a new table called 'RvnuCode' in schema 'dbo'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.RvnuCode', 'U') IS NOT NULL
 DROP TABLE dbo.RvnuCode;
GO
-- Create the table in the specified schema
CREATE TABLE dbo.RvnuCode
(
 RvnuCodeID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 RvnuCode varchar(6) NOT NULL,
 DateGenerated datetime NOT NULL,
 Expiry datetime NOT NULL,
 CONSTRAINT AK_RvnuCode UNIQUE(RvnuCode)        
);
GO

-- Insert rows into table 'RvnuCode'
INSERT INTO dbo.RvnuCode
 ([RvnuCodeID], [RvnuCode], [DateGenerated], [Expiry])
VALUES
 ('ce19e022-6bcb-4e16-8b85-e47884aa62ed', 'qwert1', '2022-06-01 22:42:00', '2022-08-19 22:42:00'),
 ('ea0f16f6-9302-4ad1-87f5-a174133ec425', 'cg56u8', '2022-06-01 22:42:00', '2022-08-23 22:42:00'),
 ('468fdb04-76c7-41fd-8d9b-8a15b642e770', '864c10', '2022-07-20 14:44:10', '2022-08-20 14:44:10');
GO


-- Create a new table called 'ExpiredRvnuCode' in schema 'dbo'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.ExpiredRvnuCode', 'U') IS NOT NULL
 DROP TABLE dbo.ExpiredRvnuCode;
GO
-- Create the table in the specified schema
CREATE TABLE dbo.ExpiredRvnuCode
(
 RvnuCodeID varchar(36) NOT NULL,
 RvnuCode varchar(6) NOT NULL,
 DateGenerated datetime NOT NULL,
 Expiry datetime NOT NULL,
 AccountID varchar(36) NOT NULL,     
);
GO


-- Create a new table called 'Merchant' in schema 'dbo'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.Merchant', 'U') IS NOT NULL
 DROP TABLE dbo.Merchant;
GO
-- Create the table in the specified schema
CREATE TABLE dbo.Merchant
(
 MerchantID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 MerchantName varchar(20) NOT NULL,
 Email varchar(50) NOT NULL,
 Password varchar(50) NOT NULL,
 MinimumSpend decimal(10,2) NOT NULL,
 CommissionPercentage decimal(10,2) NOT NULL,
 SortCode varchar(6) NOT NULL,
 AccountNumber varchar(8) NOT NULL,
 Tl_providerId varchar(50) NOT NULL,
 AccountCreated datetime NOT NULL,
 CONSTRAINT AK_MerchantName UNIQUE(MerchantName), 
 CONSTRAINT AK_MerchantEmail UNIQUE(Email)       
);
GO

-- Insert rows into table 'Merchant'
INSERT INTO dbo.Merchant
 ([MerchantID], [MerchantName], [Email], [Password], [MinimumSpend], [CommissionPercentage], [SortCode], [AccountNumber], [Tl_providerId], [AccountCreated])
VALUES
 ('41784630-695b-4003-9588-89b322b59ac2', 'ASOS', 'asos@info.com', 'pass123', 50.00, 5.00, '123456', '12345678', 'ob-natwest', '2022-06-30 22:42:00');
GO


-- Create a new table called 'RvnuTransaction' in schema 'dbo'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.RvnuTransaction', 'U') IS NOT NULL
 DROP TABLE dbo.RvnuTransaction;
GO
-- Create the table in the specified schema
CREATE TABLE dbo.RvnuTransaction
(
 PaymentID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 MerchantID varchar(36) NOT NULL,
 AccountID varchar(36) NOT NULL,
 DateTime datetime NOT NULL,
 Currency varchar(3) NOT NULL,
 TotalAmount decimal(10,2) NOT NULL, 
 RvnuCodeID varchar(36) NOT NULL, 
 RvnuFee decimal(10,2) NOT NULL, 
 UserCommission decimal(10,2) NOT NULL, 
 Reference varchar(36) NOT NULL,
 Status varchar(20),
 EventID varchar(36),
 Webhook_Datetime varchar(25),
 Webhook_Description varchar(20)
);
GO


-- Create a new table called 'RvnuAccountPayout' in schema 'dbo'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.RvnuAccountPayout', 'U') IS NOT NULL
 DROP TABLE dbo.RvnuAccountPayout;
GO
-- Create the table in the specified schema
CREATE TABLE dbo.RvnuAccountPayout
(
 PayoutID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 AccountID varchar(36) NOT NULL,
 TotalAmount decimal(10,2) NOT NULL, 
 DateTime datetime NOT NULL
);
GO


-- Create a new table called 'Invoice' in schema 'dbo'
-- Drop the table if it already exists
IF OBJECT_ID('dbo.Invoice', 'U') IS NOT NULL
 DROP TABLE dbo.Invoice;
GO
-- Create the table in the specified schema
CREATE TABLE dbo.Invoice
(
 InvoiceID varchar(36) NOT NULL PRIMARY KEY, -- primary key column
 MerchantID varchar(36) NOT NULL,
 TotalAmount decimal(10,2) NOT NULL, 
 DateTime datetime NOT NULL,
 DueDate datetime NOT NULL
);
GO