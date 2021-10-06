import algosdk from "algosdk"
import { getParams, waitForConfirmation, getCore } from "./utils.js"
export { getParams, waitForConfirmation }
import { orderedAssets, managerAppId, assetDictionary, orderedOracleAppIds, orderedMarketAppIds } from "./config.js"
export { orderedAssets, managerAppId, assetDictionary, orderedOracleAppIds, orderedMarketAppIds }

export async function optInMarkets(algodClient, address) {
  const params = await getParams(algodClient)
  let txns = []
  for (const assetName of orderedAssets) {
    txns.push(
      algosdk.makeApplicationOptInTxnFromObject({
        from: address,
        appIndex: assetDictionary[assetName]["marketAppId"],
        suggestedParams: params,
      })
    )
  }
  algosdk.assignGroupID(txns)
  return txns
}
export async function optInAssets(algodClient, address) {
  const params = await getParams(algodClient)
  let txns = []
  for (const assetName of orderedAssets) {
    if (assetName != "ALGO") {
      txns.push(
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          // Escrow txn
          suggestedParams: params,
          to: address,
          amount: 0,
          assetIndex: assetDictionary[assetName]["underlyingAssetId"],
          from: address,
        })
      )
    }
    txns.push(
      algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        // Escrow txn
        suggestedParams: params,
        to: address,
        amount: 0,
        assetIndex: assetDictionary[assetName]["bankAssetId"],
        from: address,
      })
    )
  }
  algosdk.assignGroupID(txns)
  return txns
}

export async function optInManager(algodClient, address, storageAddress) {
  const params = await getParams(algodClient)
  let txns = []
  txns.push(
    algosdk.makeApplicationOptInTxnFromObject({
      from: address,
      appIndex: managerAppId,
      suggestedParams: params,
    })
  )
  txns.push(
    algosdk.makeApplicationOptInTxnFromObject({
      from: storageAddress,
      appIndex: managerAppId,
      suggestedParams: params,
      rekeyTo: algosdk.getApplicationAddress(managerAppId),
    })
  )
  algosdk.assignGroupID(txns)
  return txns
}

export async function mint(algodClient, address, storageAddress, amount, assetName) {
  const params = await getParams(algodClient)
  let txns = await getCore(
    algodClient,
    address,
    storageAddress,
    assetDictionary[assetName]["marketAppId"],
    assetDictionary[assetName]["bankAssetId"],
    "mint"
  )
  txns.push(
    algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: assetDictionary[assetName]["marketAddress"],
      amount: amount,
      assetIndex: assetDictionary[assetName]["underlyingAssetId"],
      suggestedParams: params,
    })
  )
  algosdk.assignGroupID(txns)
  return txns
}

export async function mintToCollateral(algodClient, address, storageAddress, amount, assetName) {
  const params = await getParams(algodClient)
  let txns = await getCore(
    algodClient,
    address,
    storageAddress,
    assetDictionary[assetName]["marketAppId"],
    assetDictionary[assetName]["bankAssetId"],
    "mint_to_collateral"
  )
  txns.push(
    algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: assetDictionary[assetName]["marketAddress"],
      amount: amount,
      assetIndex: assetDictionary[assetName]["underlyingAssetId"],
      suggestedParams: params,
    })
  )
  algosdk.assignGroupID(txns)
  return txns
}

export async function burn(algodClient, address, storageAddress, amount, assetName) {
  const params = await getParams(algodClient)
  let txns = await getCore(
    algodClient,
    address,
    storageAddress,
    assetDictionary[assetName]["marketAppId"],
    assetDictionary[assetName]["underlyingAssetId"],
    "burn"
  )
  txns.push(
    algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: assetDictionary[assetName]["marketAddress"],
      amount: amount,
      assetIndex: assetDictionary[assetName]["bankAssetId"],
      suggestedParams: params,
    })
  )
  algosdk.assignGroupID(txns)
  return txns
}

export async function addCollateral(algodClient, address, storageAddress, amount, assetName) {
  const params = await getParams(algodClient)
  let txns = await getCore(
    algodClient,
    address,
    storageAddress,
    assetDictionary[assetName]["marketAppId"],
    assetDictionary[assetName]["underlyingAssetId"],
    "add_collateral"
  )
  txns.push(
    algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: assetDictionary[assetName]["marketAddress"],
      amount: amount,
      assetIndex: assetDictionary[assetName]["bankAssetId"],
      suggestedParams: params,
    })
  )
  algosdk.assignGroupID(txns)
  return txns
}

export async function removeCollateral(algodClient, address, storageAddress, amount, assetName) {
  let txns = await getCore(
    algodClient,
    address,
    storageAddress,
    assetDictionary[assetName]["marketAppId"],
    assetDictionary[assetName]["bankAssetId"],
    "remove_collateral",
    algosdk.encodeUint64(amount)
  )
  algosdk.assignGroupID(txns)
  return txns
}

export async function removeCollateralUnderlying(algodClient, address, storageAddress, amount, assetName) {
  let txns = await getCore(
    algodClient,
    address,
    storageAddress,
    assetDictionary[assetName]["marketAppId"],
    assetDictionary[assetName]["underlyingAssetId"],
    "remove_collateral_underlying",
    algosdk.encodeUint64(amount)
  )
  algosdk.assignGroupID(txns)
  return txns
}

export async function borrow(algodClient, address, storageAddress, amount, assetName) {
  let txns = await getCore(
    algodClient,
    address,
    storageAddress,
    assetDictionary[assetName]["marketAppId"],
    assetDictionary[assetName]["underlyingAssetId"],
    "borrow",
    algosdk.encodeUint64(amount)
  )
  algosdk.assignGroupID(txns)
  return txns
}

export async function repayBorrow(algodClient, address, storageAddress, amount, assetName) {
  const params = await getParams(algodClient)
  let txns = await getCore(
    algodClient,
    address,
    storageAddress,
    assetDictionary[assetName]["marketAppId"],
    assetDictionary[assetName]["underlyingAssetId"],
    "repay_borrow"
  )
  txns.push(
    algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: assetDictionary[assetName]["marketAddress"],
      amount: amount,
      assetIndex: assetDictionary[assetName]["underlyingAssetId"],
      suggestedParams: params,
    })
  )
  algosdk.assignGroupID(txns)
  return txns
}

//// HAS NOT BEEN TESTED...
export async function liquidate(algodClient, address, storageAddress, liquidateStorageAddress, amount, assetName) {
  const params = await getParams(algodClient)
  let txns = await getCore(
    algodClient,
    address,
    liquidateStorageAddress,
    assetDictionary[assetName]["marketAppId"],
    assetDictionary[assetName]["underlyingAssetId"],
    "liquidate"
  )
  txns.push(
    algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: assetDictionary[assetName]["marketAddress"],
      amount: amount,
      assetIndex: assetDictionary[assetName]["underlyingAssetId"],
      suggestedParams: params,
    })
  )
  txns.push(
    algosdk.makeApplicationNoOpTxnFromObject({
      from: address,
      appIndex: marketAppId,
      foreignApps: [managerAppId],
      appArgs: [enc.encode("liquidate")],
      accounts: [liquidateStorageAddress, storageAddress],
      suggestedParams: params,
      note: enc.encode("Market: " + functionString),
    })
  )
  algosdk.assignGroupID(txns)
  return txns
}
