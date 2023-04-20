import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

export class LoadBalancer {
  private readonly _applicationLoadBalancer01: ApplicationLoadBalancer;

  constructor(scope: Construct, vpc: IVpc, securityGroup: SecurityGroup) {
    this._applicationLoadBalancer01 = new ApplicationLoadBalancer(
      scope,
      'application-load-balancer-01',
      {
        vpc,
        internetFacing: true,
        securityGroup,
      },
    );
  }

  get applicationLoadBalancer01(): ApplicationLoadBalancer {
    return this._applicationLoadBalancer01;
  }
}
