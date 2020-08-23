import AWS from "aws-sdk";
import createError from "http-errors";
import validator from '@middy/validator';

import commonMiddleware from "../lib/commonMiddleware";
import getAuctionsSchema from "../lib/schemas/getAuctionsSchema";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {

  const { status } = event.queryStringParameters;

  let auctions;

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeValues: {
      ":status": status,
    },
    ExpressionAttributeNames: {
      "#status": "status",
      // reserved word = status
    },
  };

  // dynamo db scan (which is not efficient)

  try {
    const result = await dynamoDB.query(params).promise();

    auctions = result.Items;
  } catch (error) {
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions)
  };
}

export const handler = commonMiddleware(getAuctions)
  .use(validator({ inputSchema: getAuctionsSchema, useDefaults: true }));
