const AWS = require('aws-sdk');
const s3 = new AWS.S3();

/*
  This scripts creates the two s3 buckets required by the `package` and `deploy` scripts
*/
const npm_package_name = process.argv[2];
const stage = process.argv[3];

var params = [{
  Bucket: `${npm_package_name}-${stage}`
}, {
  Bucket: `${npm_package_name}-${stage}-deploy`
}]

params.forEach((param) => {
  s3.headBucket(param, function(err, data) {
  if (err) {
    s3.createBucket(param, function(err, data) {
      if (err) {
        console.log(err);
        console.log(`Error creating bucket ${param.Bucket}`);
      } else {
        console.log(`Created bucket ${param.Bucket}`);
      }
    })
  } else {
    console.log(`${param.Bucket} exists`);
  }
})
});
