import {
  ApplicationListener,
  ApplicationLoadBalancer,
  IApplicationTargetGroup,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export class Listener {
  private readonly targetGroup01: ApplicationListener;

  constructor(
    loadBalancer: ApplicationLoadBalancer,
    targetGroup: IApplicationTargetGroup,
  ) {
    this.targetGroup01 = loadBalancer.addListener(
      'application-load-balancer-01-listener',
      {
        port: 80,
        open: true,
      },
    );

    this.targetGroup01.addTargetGroups(
      'application-load-balancer-01-target-group-01',
      {
        targetGroups: [targetGroup],
      },
    );
  }
}
