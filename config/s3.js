const AWS = require('aws-sdk');

const s3Client = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_ACCESS_KEY_SECRET,
});

const uploadParams = {
  Bucket: process.env.AWS_S3_BUCKET_NAME,
  Key: '',
  Body: null,
  ACL: 'public-read',
  region: process.env.AWS_S3_REGION,
};

const s3 = {};
s3.s3Client = s3Client;
s3.uploadParams = uploadParams;

module.exports = s3;
