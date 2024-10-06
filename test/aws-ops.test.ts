import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as AwsOps from '../lib/aws-ops-stack';

test('some test', () => {
	const app = new cdk.App();
	// WHEN
	const stack = new AwsOps.AwsOpsStack(app, 'MyTestStack');
	// THEN

	const template = Template.fromStack(stack);
});
