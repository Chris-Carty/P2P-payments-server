-- Create a new stored procedure called 'CleanUpExpiredRvnuCodes' in schema 'dbo'
-- Drop the stored procedure if it already exists
IF EXISTS (
SELECT *
    FROM INFORMATION_SCHEMA.ROUTINES
WHERE SPECIFIC_SCHEMA = N'dbo'
    AND SPECIFIC_NAME = N'CleanUpExpiredRvnuCodes'
    AND ROUTINE_TYPE = N'PROCEDURE'
)
DROP PROCEDURE dbo.CleanUpExpiredRvnuCodes
GO
-- Create the stored procedure in the specified schema
CREATE PROCEDURE dbo.CleanUpExpiredRvnuCodes
-- add more stored procedure parameters here
AS
BEGIN
    -- STEP 1: move the expired RVNUCode to the ExpiredRvnuCode table
    INSERT INTO ExpiredRvnuCode (RvnuCodeID, RvnuCode, DateGenerated, Expiry, AccountID)
    SELECT RvnuCode.*, RvnuAccount.AccountID FROM RvnuCode
    RIGHT JOIN RvnuAccount ON RvnuCode.RvnuCodeID=RvnuAccount.RvnuCodeID
    WHERE Expiry <= CURRENT_TIMESTAMP
    ORDER BY Expiry ASC
END 
BEGIN
    -- STEP 2: unlink RVNUcode for users account
    UPDATE RvnuAccount
    SET RvnuAccount.RvnuCodeID=NULL
    FROM RvnuAccount
    RIGHT JOIN RvnuCode ON RvnuAccount.RvnuCodeID=RvnuCode.RvnuCodeID
    WHERE Expiry <= CURRENT_TIMESTAMP
BEGIN
    -- STEP 3: Delete the expired code from the live RvnuCode table
    DELETE FROM RvnuCode WHERE Expiry <= CURRENT_TIMESTAMP
END
END
GO
-- example to execute the stored procedure we just created
EXECUTE dbo.CleanUpExpiredRvnuCodes
GO

