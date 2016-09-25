# Node Cloud Vision API
react-cloud-vision-api is a react client wrapper for Cloud Vision API.
This package is modification of https://www.npmjs.com/package/node-cloud-vision-api package.

Cloud Vision API Docs
https://cloud.google.com/vision/docs/

Note that it has limited features and tested only in scope of project.

Supported features

Feature Type  | Description
------------- | -------------
FACE_DETECTION  | Run face detection
LANDMARK_DETECTION  | Run models to execute landmark detection
LOGO_DETECTION | Run models to execute product logo detection
LABEL_DETECTION | Run models to execute Image Content Analysis
TEXT_DETECTION | Run models to execute OCR on an image
SAFE_SEARCH_DETECTION | Run models to compute image safe search properties


## Setup
### Preparation
- Sign up limited preview for Cloud Vision API https://cloud.google.com/vision/
- Cloud Vision API Key is needed

### Install
` npm install react-cloud-vision-api --save`

### Auth
API requests on node-cloud-vision-api is internally managed by [google-api-nodejs-client](https://github.com/google/google-api-nodejs-client/)

You can setup auth data with the following samples

* Use Server Key
```JavaScript
import vision from "react-cloud-vision-api";
vision.init({ auth: 'YOUR_API_KEY'})
```
## Sample
```JavaScript
const vision = require('react-cloud-vision-api')
vision.init({auth: 'YOUR_API_KEY'})
const req = new vision.Request({
  image: new vision.Image({
    base64: base64Img,
  }),
  features: [
    new vision.Feature('TEXT_DETECTION', 4),
    new vision.Feature('LABEL_DETECTION', 10),
  ]
})
```
