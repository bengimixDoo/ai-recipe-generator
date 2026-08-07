import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import * as iam from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
});

// 1. Lấy ra instance của AppSync API
const appsyncApi = backend.data.resources.graphqlApi;

// 2. Tạo IAM Role chuẩn cấp quyền cho AppSync AssumeRole
const geminiRole = new iam.Role(appsyncApi, 'GeminiAppSyncServiceRole', {
  assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
});

// 3. Khai báo HTTP Data Source trỏ trực tiếp sang Google Gemini từ CDK
appsyncApi.addHttpDataSource(
  'geminiHttpDS',
  'https://generativelanguage.googleapis.com',
  {
    name: 'geminiHttpDS',
    description: 'Data Source for Google Gemini API',
    serviceRole: geminiRole, // Gán role vừa khởi tạo ở trên
  }
);