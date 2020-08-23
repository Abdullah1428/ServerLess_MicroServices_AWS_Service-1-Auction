import createError from 'http-errors';

import { getEndedAuctions } from "../lib/getEndedAuctions";
import { closeAuction } from "../lib/closeAuction";

async function processAuctions(event, context) {

  try {
    const auctionsToClose = await getEndedAuctions();
    const closeAll = auctionsToClose.map(auction => closeAuction(auction));
    await Promise.all(closeAll); // close all in parallel instead sequentially

    return { closed: closeAll.length }

  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error); // not recommended for production level ony for dev purposes
  }
}

export const handler = processAuctions;

// middy will be used when API Gateway is used

// sls logs -f lambdaFunction -t (tailing) --startTime 1m

// sls invoke -f processAuctions -l
