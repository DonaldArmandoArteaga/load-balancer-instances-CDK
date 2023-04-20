import * as cdk from 'aws-cdk-lib';
import { Instance } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { Instances } from './ec2/ec2-instances';
import { Listener } from './load-balancer/listeners';
import { LoadBalancer } from './load-balancer/load-balancers';
import { TargetGroup } from './load-balancer/target-groups';
import { SecurityGroups } from './networking/security-groups';
import { VPC } from './networking/vpc';

export class LoadBalancerStack extends cdk.Stack {

  private readonly _defaultVPC: VPC
  private readonly _securityGropups: SecurityGroups
  private readonly _instances: Instances
  private readonly _loadBalancer: LoadBalancer
  private readonly _targetGroup: TargetGroup


  constructor(scope: Construct, id: string, props?: cdk.StackProps) {

    super(scope, id, props);


    this._defaultVPC = new VPC(this)
    this._securityGropups = new SecurityGroups(this, this._defaultVPC.vpc)
    this._instances = new Instances(this, this._defaultVPC.vpc, this._securityGropups.httpTrafic)
    this._loadBalancer = new LoadBalancer(this, this._defaultVPC.vpc, this._securityGropups.httpTrafic)
    this._targetGroup = new TargetGroup(this, this._defaultVPC.vpc, this._instances.instances)
    new Listener(this._loadBalancer.applicationLoadBalancer01, this._targetGroup.targetGroup01)


    this._instances.instances.forEach((instance: Instance, index) => {
      new cdk.CfnOutput(this, `ec2-web-server-${index}-public-IP`, {
        value: instance.instancePublicIp,
        description: 'Web server public IP',
      });
    })

    new cdk.CfnOutput(this, 'application-load-balancer-01-IP', {
      value: this._loadBalancer.applicationLoadBalancer01.loadBalancerDnsName,
      description: 'Application load balancer DNS name',
    });


  }

  public get defaultVPC(): VPC {
    return this._defaultVPC;
  }

  public get securityGropups(): SecurityGroups {
    return this._securityGropups;
  }

  public get instances(): Instances {
    return this._instances;
  }

  public get loadBalancer(): LoadBalancer {
    return this._loadBalancer;
  }

  public get targetGroup(): TargetGroup {
    return this._targetGroup;
  }

}

