import {
  AmazonLinuxGeneration,
  AmazonLinuxImage,
  IVpc,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  SecurityGroup,
  SubnetType,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { readFileSync } from 'fs';

export class Instances {
  private readonly _instances: Array<Instance>;

  constructor(scope: Construct, vpc: IVpc, securityGroup: SecurityGroup) {
    const userDataScript = readFileSync('./scripts/loadHTTPServer.sh', 'utf8');

    this._instances = Array.of(1, 2).map(
      (index) =>
        new Instance(scope, `web-server-${index}`, {
          vpc,
          vpcSubnets: {
            subnetType: SubnetType.PUBLIC,
            availabilityZones: ['us-east-1c'],
          },
          securityGroup,
          instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
          machineImage: new AmazonLinuxImage({
            generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
          }),
        }),
    );

    this._instances.forEach((instance) => {
      instance.addUserData(userDataScript);
    });
  }

  public get instances(): Array<Instance> {
    return this._instances;
  }
}
