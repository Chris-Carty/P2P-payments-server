import connection from '../config/dbConfig.js'

export const getMerchantRvnuAccount = async (req, res) => {
    // Gets Merchants Account Information
    const merchantId = req.params.merchantId
    console.log(merchantId)
    
    const query = "SELECT MerchantID, MerchantName, MinimumSpend, CommissionPercentage, AccountNumber, SortCode FROM Merchant WHERE MerchantID ='"+ merchantId +"' LIMIT 1"
  
    try {
      connection.query(query, (err, data) => {
        if(err) return res.status(409).send({ message: err.message })
        res.status(200).json({data});
      });
    } catch (err) {
        res.status(409).send({ message: err.message })
    }
  
  }