export default {
    MAX_ATTACHMENT_SIZE: 5000000,
    STRIPE_KEY: "pk_test_DBQzyMigN4iHNGAHjdFlGXe800Lz07tJao",
    s3: {
      REGION: "us-east-2",
      BUCKET: "akwork-notes-upload"
    },
    apiGateway: {
      REGION: "us-east-2",
      URL: "https://8fuoz95v08.execute-api.us-east-2.amazonaws.com/prod"
    },
    cognito: {
      REGION: "us-east-2",
      USER_POOL_ID: "us-east-2_iUVLZ6jGi",
      APP_CLIENT_ID: "73bvjl57fjr3d07c5gg9n9gqjo",
      IDENTITY_POOL_ID: "us-east-2:3be020af-1cf6-4159-a130-63a18fdc3cf8"
    }
  };