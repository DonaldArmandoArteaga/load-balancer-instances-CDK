import { Duration } from 'aws-cdk-lib';
import { IVpc, Instance } from 'aws-cdk-lib/aws-ec2';
import { ApplicationTargetGroup } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { InstanceTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Construct } from 'constructs';

export class TargetGroup {
  private readonly _targetGroup01: ApplicationTargetGroup;

  constructor(scope: Construct, vpc: IVpc, instances: Array<Instance>) {
    this._targetGroup01 = new ApplicationTargetGroup(scope, 'target-group-01', {
      vpc,
      port: 80,
      healthCheck: {
        path: '/index.html',
        unhealthyThresholdCount: 2,
        healthyThresholdCount: 5,
        interval: Duration.seconds(30),
      },
    });

    instances.forEach((instance) => {
      this._targetGroup01.addTarget(new InstanceTarget(instance));
    });
  }

  get targetGroup01(): ApplicationTargetGroup {
    return this._targetGroup01;
  }
}
