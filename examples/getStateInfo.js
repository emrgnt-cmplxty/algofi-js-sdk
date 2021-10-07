const algosdk = require("algosdk")
const algofi = require("@algofi/v0")
require("dotenv").config()

async function run() {
  const algodToken = {
    "X-API-Key": process.env.algodSecret,
  }
  // not all node providers require a token, please check w/ yours
  const algodClient = new algosdk.Algodv2(algodToken, process.env.algodServer, process.env.algodPort)
  let primaryAccount = algosdk.mnemonicToSecretKey(process.env.primaryPass)
  console.log("PRIMARY ACCOUNT ADDRESS=", primaryAccount.addr)

  console.log("FETCHING DATA")
  let userAndProtocolData = await algofi.getUserAndProtocolData(algodClient, primaryAccount.addr)
  console.log("userAndProtocolData=", userAndProtocolData)
}

run()
