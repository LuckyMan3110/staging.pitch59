const AWS = require("aws-sdk");

console.log("Credentials:");
console.log(AWS.config.credentials);
const s3 = new AWS.S3();

const bucketName = "pitch59-prod";
let params;

function setParamsForUpload(file, prefixedBusinessId) {
	return {
		Bucket: bucketName,
		Body: file,
		Key: prefixedBusinessId + '.jpg'
	};
};

function setParamsForFileCheck(prefixedBusinessId) {
	return {
		Bucket: bucketName,
		Key: prefixedBusinessId + '.jpg'
	}
}

const BucketWorker = {
	async isFileExists(prefixedBusinessId) {
		params = setParamsForFileCheck(prefixedBusinessId);
		try {
			await s3.headObject(params).promise();
			return true;
		} catch (error) {
			if (error.code === 'NotFound') {
				return false;
			}
			throw error;
		}
	},
  upload(file, prefixedBusinessId) {
		params = setParamsForUpload(file, prefixedBusinessId);
		s3.upload(params, function (err, data) {
			//handle error
			if (err) {
				console.log("Error", err);
			}
		
			//success
			if (data) {
				console.log(data.Location);
				return data.Location;
			}
		});
	},
};

export default BucketWorker;
