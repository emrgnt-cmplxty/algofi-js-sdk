const algosdk = require("algosdk")
import {
  orderedAssets,
  managerAppId,
  assetDictionary,
  SECONDS_PER_YEAR,
  RESERVE_RATIO,
  SCALE_FACTOR,
} from "./config.js"
import { Base64Encoder } from "./encoder.js"

export async function getPriceInfo(algodClient) {
  let prices = {}
  for (const assetName of orderedAssets) {
    let response = await algodClient.getApplicationByID(assetDictionary[assetName]["oracleAppId"]).do()
    for (const y of response.params["global-state"]) {
      let decodedKey = Base64Encoder.decode(y.key)
      if (decodedKey === "price") {
        prices[assetName] = y.value.uint
      }
    }
  }
  return prices
}

export async function getBalanceInfo(algodClient, address) {
  let accountInfo = await algodClient.accountInformation(address).do()
  let balanceInfo = {}
  balanceInfo["ALGO"] = accountInfo["amount"]
  for (const assetName of orderedAssets) {
    if (assetName != "ALGO") {
      balanceInfo[assetName] = 0
    }
    balanceInfo["b" + assetName] = 0
  }
  for (const asset of accountInfo.assets) {
    for (const assetName of orderedAssets) {
      if (assetName != "ALGO" && asset["asset-id"] === assetDictionary[assetName]["underlyingAssetId"]) {
        balanceInfo[assetName] = Number(asset["amount"])
      } else if (asset["asset-id"] === assetDictionary[assetName]["bankAssetId"]) {
        balanceInfo["b" + assetName] = Number(asset["amount"])
      }
    }
  }
  return balanceInfo
}

export async function getStorageAddress(accountInfo) {
  let storageAccount = null

  let localManager = accountInfo["apps-local-state"].filter((x) => {
    return x.id === managerAppId && x["key-value"]
  })

  if (localManager && localManager.length > 0) {
    let storageAccountBytes = localManager[0]["key-value"].filter((x) => {
      return x.key == "dXNlcl9zdG9yYWdlX2FkZHJlc3M="
    })[0].value.bytes
    storageAccount = algosdk.encodeAddress(Buffer.from(storageAccountBytes, "base64"))
  }
  return storageAccount
}

export async function getGlobalMarketInfo(algodClient, marketId) {
  let response = await algodClient.getApplicationByID(marketId).do()
  let results = {}
  response.params["global-state"].forEach((x) => {
    let decodedKey = Base64Encoder.decode(x.key)
    results[decodedKey] = x.value.uint
  })
  return results
}

export async function extrapolateMarketData(globalData) {
  let extrapolatedData = {}
  let currentUnixTime = Date.now()
  currentUnixTime = Math.floor(currentUnixTime / 1000)
  globalData["total_lend_interest_rate_earned"] =
    (globalData["total_borrow_interest_rate"] * globalData["underlying_borrowed"]) /
    (globalData["underlying_borrowed"] + globalData["underlying_cash"])
  extrapolatedData["total_borrow_interest_rate_paid"] =
    (globalData["total_borrow_interest_rate"] * globalData["underlying_borrowed"]) /
    (globalData["underlying_borrowed"] + globalData["underlying_cash"])
  extrapolatedData["borrow_index_extrapolated"] = Math.floor(
    globalData["borrow_index"] *
      (1 +
        ((globalData["total_borrow_interest_rate"] / 1e9) * (currentUnixTime - globalData["latest_time"])) /
          SECONDS_PER_YEAR)
  )
  extrapolatedData["underlying_borrowed_extrapolated"] =
    extrapolatedData["borrow_index_extrapolated"] > 0
      ? (globalData["underlying_borrowed"] * extrapolatedData["borrow_index_extrapolated"]) / globalData["borrow_index"]
      : 0
  extrapolatedData["underlying_reserves_extrapolated"] =
    (extrapolatedData["underlying_borrowed_extrapolated"] - globalData["underlying_borrowed"]) * RESERVE_RATIO +
    globalData["underlying_reserves"]
  extrapolatedData["bank_to_underlying_exchange_extrapolated"] =
    ((extrapolatedData["underlying_borrowed_extrapolated"] -
      extrapolatedData["underlying_reserves_extrapolated"] +
      globalData["underlying_cash"]) /
      globalData["bank_circulation"]) *
    SCALE_FACTOR
  return extrapolatedData
}

export async function getUserMarketData(accountInfo, assetName) {
  let results = {}
  let marketData = accountInfo["apps-local-state"].filter((x) => {
    return x.id === assetDictionary[assetName]["marketAppId"] && x["key-value"]
  })[0]
  if (marketData) {
    marketData["key-value"].forEach((y) => {
      let decodedKey = Base64Encoder.decode(y.key)
      if (decodedKey === "user_borrowed_amount") {
        results["borrowed"] = y.value.uint
      } else if (decodedKey === "user_active_collateral_amount") {
        results["collateral"] = y.value.uint
      } else if (decodedKey === "user_bank_minted") {
        results["minted"] = Number(y.value.uint)
      } else if (decodedKey === "user_borrow_index_initial") {
        results["initial_index"] = Number(y.value.uint)
      }
    })
  }
  return results
}

export async function extrapolateUserData(userData, globalData) {
  let extrapolatedData = {}
  extrapolatedData["borrowed_current_extrapolated"] =
    userData["borrowed"] && globalData["borrow_index"]
      ? (userData["borrowed"] * globalData["borrow_index"]) / userData["initial_index"]
      : 0
  extrapolatedData["supplied_underlying"] =
    userData["minted"] && globalData["borrow_index"]
      ? (userData["minted"] * globalData["bank_to_underlying_exchange_extrapolated"]) / SCALE_FACTOR
      : 0
  return extrapolatedData
}
