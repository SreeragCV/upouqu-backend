// const { S3 } = require("aws-sdk");
const uuid = require("uuid").v4;
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// exports.s3UploadV2 = async (files) => {
//   const s3 = new S3();
//   const params = files.map((file) => {
//     return {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: `uploads/${uuid}-${file.originalname}`,
//       Body: file.buffer,
//     };
//   });
//   return await Promise.all(params.map((param) => s3.upload(param).promise()));
// };

exports.s3UploadV3 = async (files) => {
  const s3Client = new S3Client();
  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
  });
  const results = await Promise.all(
    params.map((param) => s3Client.send(new PutObjectCommand(param)))
  );

  return { results, params };
};
