import AWS from "aws-sdk";
import validator from "@middy/validator";
import createError from "http-errors";

import commonMiddleware from "../lib/commonMiddleware";
import placeBidSchema from "../lib/schemas/placeBidSchema";

import { getAuctionByID } from "./getAuction";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const { email } = event.requestContext.authorizer;

  const auction = await getAuctionByID(id);

  // status validation
  if (auction.status !== 'OPEN') {
    throw new createError.Forbidden(
      `You cannot bid on closed auctions!`
    )
  }

  // amount
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher then ${auction.highestBid.amount}!`
    );
  }

  // user or bidder validation
  if (email === auction.seller) {
    throw new createError.Forbidden(`You cannot bid on your own auctions!`);
  }

  // avoid double bidding
  if (email === auction.highestBid.bidder) {
    throw new createError.Forbidden(`You are already the highest bidder!!`);
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set highestBid.amount = :amount, highestBid.bidder = :bidder",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email,
    },
    ReturnValues: "ALL_NEW"
  };

  let updatedAuction;

  try {
    const result = await dynamoDB.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction)
  };
}

export const handler = commonMiddleware(placeBid)
  .use(validator({ inputSchema: placeBidSchema }));
