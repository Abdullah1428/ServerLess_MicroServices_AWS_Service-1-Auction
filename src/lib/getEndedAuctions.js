import AWS from "aws-sdk";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export async function getEndedAuctions() {
  const now = new Date();

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status AND endingAt <= :now",
    ExpressionAttributeValues: {
      ":status": "OPEN",
      ":now": now.toISOString()
    },
    ExpressionAttributeNames: {
      "#status": "status"
      // reserved word = status
    }
  };

  const result = await dynamoDB.query(params).promise();

  return result.Items;
}
