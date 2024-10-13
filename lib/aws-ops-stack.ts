import {
	Stack,
	StackProps,
	aws_elasticloadbalancingv2 as elbv2,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class AwsOpsStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		/**
		 * VPC
		 */
		const vpc = new ec2.CfnVPC(this, 'vpc', {
			cidrBlock: '10.0.0.0/16',
			tags: [
				{
					key: 'Name',
					value: 'vpc',
				},
			],
			enableDnsHostnames: true,
			enableDnsSupport: true,
		});
		const igw = new ec2.CfnInternetGateway(this, 'igw', {
			tags: [
				{
					key: 'Name',
					value: 'igw',
				},
			],
		});
		new ec2.CfnVPCGatewayAttachment(this, 'igwAttachment', {
			internetGatewayId: igw.ref,
			vpcId: vpc.ref,
		});

		/**
		 * subnets
		 */
		const subnetPublic1a = new ec2.CfnSubnet(this, 'subnetPublic1a', {
			cidrBlock: '10.0.0.0/24',
			vpcId: vpc.ref,
			availabilityZone: 'ap-northeast-1a',
			tags: [{ key: 'Name', value: 'public-subnet-1a' }],
		});
		const subnetPublic1c = new ec2.CfnSubnet(this, 'subnetPublic1c', {
			cidrBlock: '10.0.1.0/24',
			vpcId: vpc.ref,
			availabilityZone: 'ap-northeast-1c',
			tags: [{ key: 'Name', value: 'public-subnet-1c' }],
		});
		const subnetPrivate1a = new ec2.CfnSubnet(this, 'subnetPrivate1a', {
			cidrBlock: '10.0.8.0/24',
			vpcId: vpc.ref,
			availabilityZone: 'ap-northeast-1a',
			tags: [{ key: 'Name', value: 'private-subnet-1a' }],
		});
		const subnetPrivate1c = new ec2.CfnSubnet(this, 'subnetPrivate1c', {
			cidrBlock: '10.0.9.0/24',
			vpcId: vpc.ref,
			availabilityZone: 'ap-northeast-1c',
			tags: [{ key: 'Name', value: 'private-subnet-1c' }],
		});

		/**
		 * RouteTables
		 */
		const publicRouteTable = new ec2.CfnRouteTable(this, 'publicRouteTable', {
			vpcId: vpc.ref,
			tags: [
				{
					key: 'Name',
					value: 'publicRouteTable',
				},
			],
		});
		new ec2.CfnRoute(this, 'publicRoute', {
			routeTableId: publicRouteTable.ref,
			destinationCidrBlock: '0.0.0.0/0',
			gatewayId: igw.ref,
		});
		new ec2.CfnSubnetRouteTableAssociation(
			this,
			'publicSubnet1aRouteTableAssociation',
			{
				routeTableId: publicRouteTable.ref,
				subnetId: subnetPublic1a.ref,
			}
		);
		new ec2.CfnSubnetRouteTableAssociation(
			this,
			'publicSubnet1cRouteTableAssociation',
			{
				routeTableId: publicRouteTable.ref,
				subnetId: subnetPublic1c.ref,
			}
		);
		const privateRouteTable = new ec2.CfnRouteTable(this, 'privateRouteTable', {
			vpcId: vpc.ref,
			tags: [
				{
					key: 'Name',
					value: 'privateRouteTable',
				},
			],
		});
		new ec2.CfnSubnetRouteTableAssociation(
			this,
			'privateSubnet1aRouteTableAssociation',
			{
				routeTableId: privateRouteTable.ref,
				subnetId: subnetPrivate1a.ref,
			}
		);
		new ec2.CfnSubnetRouteTableAssociation(
			this,
			'privateSubnet1cRouteTableAssociation',
			{
				routeTableId: privateRouteTable.ref,
				subnetId: subnetPrivate1c.ref,
			}
		);

		/**
		 * LoadBalancer
		 */
		const sgForELB = new ec2.CfnSecurityGroup(this, 'sgForELB', {
			groupDescription: 'security group for ELB',
			securityGroupIngress: [
				{
					ipProtocol: 'TCP',
					cidrIp: '0.0.0.0/0',
					fromPort: 80,
					toPort: 80,
				},
			],
			vpcId: vpc.ref,
		});
		const elasticLoadBalancer = new elbv2.CfnLoadBalancer(
			this,
			'elasticLoadBalancer',
			{
				subnets: [subnetPublic1a.ref, subnetPublic1c.ref],
				name: 'elasticLoadBalancer',
				securityGroups: [sgForELB.ref],
			}
		);
		const defaultListenerRule = new elbv2.CfnListener(
			this,
			'defaultListenerRule',
			{
				defaultActions: [
					{
						type: 'fixed-response',
						fixedResponseConfig: {
							statusCode: '200',
							contentType: 'text/plain',
							messageBody: 'default response',
						},
					},
				],
				loadBalancerArn: elasticLoadBalancer.ref,
				port: 80,
				protocol: 'HTTP',
			}
		);

		/**
		 * VPCEndpoints
		 */
		const sgForVPCE = new ec2.CfnSecurityGroup(this, 'sgForVPCE', {
			groupDescription: 'security group for VPCE',
			securityGroupIngress: [
				{
					ipProtocol: '-1',
					cidrIp: '0.0.0.0/0',
				},
			],
			vpcId: vpc.ref,
		});
		const s3VPCE = new ec2.CfnVPCEndpoint(this, 's3VPCE', {
			serviceName: 'com.amazonaws.ap-northeast-1.s3',
			vpcEndpointType: 'Gateway',
			vpcId: vpc.ref,
			routeTableIds: [publicRouteTable.ref, privateRouteTable.ref],
		});
		const ecrDkrVPCE = new ec2.CfnVPCEndpoint(this, 'ecrDkrVPCE', {
			serviceName: 'com.amazonaws.ap-northeast-1.ecr.dkr',
			vpcEndpointType: 'Interface',
			subnetIds: [subnetPrivate1a.ref, subnetPrivate1c.ref],
			securityGroupIds: [sgForVPCE.ref],
			vpcId: vpc.ref,
			privateDnsEnabled: true,
		});
		const ecrApiVPCE = new ec2.CfnVPCEndpoint(this, 'ecrApiVPCE', {
			serviceName: 'com.amazonaws.ap-northeast-1.ecr.api',
			vpcEndpointType: 'Interface',
			subnetIds: [subnetPrivate1a.ref, subnetPrivate1c.ref],
			securityGroupIds: [sgForVPCE.ref],
			vpcId: vpc.ref,
			privateDnsEnabled: true,
		});
		const logVPCE = new ec2.CfnVPCEndpoint(this, 'logVPCE', {
			serviceName: 'com.amazonaws.ap-northeast-1.logs',
			vpcEndpointType: 'Interface',
			subnetIds: [subnetPrivate1a.ref, subnetPrivate1c.ref],
			securityGroupIds: [sgForVPCE.ref],
			vpcId: vpc.ref,
			privateDnsEnabled: true,
		});
	}
}
