import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class AwsOpsStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		// vpc
		const vpc = new ec2.CfnVPC(this, 'vpc', {
			cidrBlock: '10.0.0.0/16',
			tags: [
				{
					key: 'Name',
					value: 'vpc',
				},
			],
		});

		// InternetGateway
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

		// PublicSubnet
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

		// PrivateSubnet
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

		// RouteTable
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
	}
}
