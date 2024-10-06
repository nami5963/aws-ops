#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsOpsStack } from '../lib/aws-ops-stack';

const app = new cdk.App();
new AwsOpsStack(app, 'AwsOpsStack');
