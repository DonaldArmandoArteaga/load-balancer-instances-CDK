import { IVpc, IpAddresses, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VPC {
  private readonly _vpc: IVpc;

  constructor(scope: Construct) {
    this._vpc = new Vpc(scope, 'load-balancer-vpc', {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      natGateways: 1,
      subnetConfiguration: [
        {
          name: 'load-balancer-subnet',
          cidrMask: 24,
          subnetType: SubnetType.PUBLIC,
        },
      ],
      availabilityZones: ['us-east-1a', 'us-east-1c'],
    });
  }

  get vpc(): IVpc {
    return this._vpc;
  }
}
