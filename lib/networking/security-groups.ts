import { IVpc, Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class SecurityGroups {
  private readonly _httpTrafic: SecurityGroup;

  constructor(scope: Construct, vpc: IVpc) {
    this._httpTrafic = new SecurityGroup(scope, 'allow-htpp-traffic-sg', {
      vpc,
      allowAllOutbound: true,
    });

    this._httpTrafic.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(80),
      'allow HTTP access from anywhere',
    );
  }

  get httpTrafic(): SecurityGroup {
    return this._httpTrafic;
  }
}
