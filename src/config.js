export const orderedAssets = ["ALGO", "USDC", "YLDY", "BANK"]
export const managerAppId = 426274692
export const assetDictionary = {
  ALGO: {
    underlyingAssetId: 1,
    bankAssetId: 426277015,
    oracleAppId: 426274932,
    marketAppId: 426274851,
    marketAddress: "D2QAEFGZMXYY3OUN2IR6ZYNSYREUJ7LOOMUZ347MHJFEXFAMQOIEUJFTDA",
  },
  USDC: {
    underlyingAssetId: 426273818,
    bankAssetId: 426277020,
    oracleAppId: 426274938,
    marketAppId: 426274855,
    marketAddress: "IQ6REIGVBNVYE4QQAL5MLBGAAVXYVDPZIVZ6IXHYHJOIMRFAE4GVIWSADA",
  },
  YLDY: {
    underlyingAssetId: 426273825,
    bankAssetId: 426277024,
    oracleAppId: 426274943,
    marketAppId: 426274861,
    marketAddress: "XWNO5GRSHCXEEQRRLKPE25MAXPTQHSCYHVPVR5PJS2GEMS6G3KULQQERHI",
  },
  BANK: {
    underlyingAssetId: 426273835,
    bankAssetId: 426277029,
    oracleAppId: 426274958,
    marketAppId: 426274866,
    marketAddress: "QJEQJ5UWFJBZL76FVZPURLEWIQTBEUX6YQTZE2XCAJ65VJP3T4CQIB467Y",
  },
}

let orderedOracleAppIds = []
let orderedMarketAppIds = []
for (const assetName of orderedAssets) {
  orderedOracleAppIds.push(assetDictionary[assetName]["oracleAppId"])
  orderedMarketAppIds.push(assetDictionary[assetName]["marketAppId"])
}
export { orderedOracleAppIds, orderedMarketAppIds }
