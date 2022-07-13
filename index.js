const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB({
  apiVersion: '2012-08-10'
});

const { TABLE_NAME, TARGET_BUCKET } = process.env;

exports.handler = async function(event, context) {
  // Log the received event
  console.log('Received event: ', JSON.stringify(event, null, 2));

  const { bucket, object } = event.Records[0].s3;

  // region Get Object from S3

  const getObjectParams = {
    Bucket: bucket.name,
    Key: decodeURIComponent(object.key.replace(/\\+/g, ' ')),
  };

  const getObjectResponse = await s3.getObject(getObjectParams).promise()
    .catch((err) => {
      console.log('Failed to get object from S3: ', JSON.stringify(err, null, 2));
      return null;
    });

  if (!getObjectResponse) {
    return;
  }

  // endregion

  // region Put Item to DynamoDB

  const putItemParams = {
    TableName: TABLE_NAME,
    Item: {
      ImagePath: {
        S: object.key
      }
    },
    ReturnConsumedCapacity: 'TOTAL'
  };

  const putItemResponse = await dynamoDB.putItem(putItemParams).promise().catch(() => null)

  if (!putItemResponse) {
    console.log('Failed to put item in DynamoDB');
    return;
  }

  // endregion

  // region Put object to target bucket

  const resizedBuffer = await sharp(getObjectResponse.Body)
    .resize(200, 200, { fit: 'cover' })
    .toBuffer();

  const putObjectParams = {
    Bucket: TARGET_BUCKET,
    Key: object.key,
    Body: resizedBuffer,
    ContentType: getObjectResponse.ContentType
  };

  const putObjectResponse = await s3.putObject(putObjectParams).promise()
    .catch((err) => {
      console.log('Failed to put object from S3: ', JSON.stringify(err, null, 2));
      return null;
    });

  if (!putObjectResponse) {
    return;
  }

  // endregion

  context.succeed(putObjectResponse.ETag);
};
