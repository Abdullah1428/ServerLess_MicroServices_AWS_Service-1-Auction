async function processAuctions(event, context) {
  console.log("processing your auctions");
}

export const handler = processAuctions;

// middy will be used when API Gateway is used

// sls logs -f lambdaFunction -t (tailing) --startTime 1m

// sls invoke -f processAuctions -l
