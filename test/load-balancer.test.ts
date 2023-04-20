import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as LoadBalancer from '../lib/load-balancer-stack';
import { LoadBalancerStack } from '../lib/load-balancer-stack';

describe('Verify resources creation', () => {
  let stack: LoadBalancerStack;
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    stack = new LoadBalancer.LoadBalancerStack(app, 'LoadBalancerStack');
    template = Template.fromStack(stack);
  });

  test('VPC created', () => {
    template.hasResourceProperties('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/16',
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
      InstanceTenancy: 'default',
      Tags: [
        {
          Key: 'Name',
          Value: 'LoadBalancerStack/load-balancer-vpc',
        },
      ],
    });
  });

  test('SubNet created', () => {
    template.hasResourceProperties('AWS::EC2::Subnet', {
      VpcId: stack.resolve(stack.defaultVPC.vpc.vpcId),
      AvailabilityZone: 'us-east-1a',
      CidrBlock: '10.0.0.0/24',
      MapPublicIpOnLaunch: true,
      Tags: [
        {
          Key: 'aws-cdk:subnet-name',
          Value: 'load-balancer-subnet',
        },
        {
          Key: 'aws-cdk:subnet-type',
          Value: 'Public',
        },
        {
          Key: 'Name',
          Value:
            'LoadBalancerStack/load-balancer-vpc/load-balancer-subnetSubnet1',
        },
      ],
    });

    template.hasResourceProperties('AWS::EC2::Subnet', {
      VpcId: stack.resolve(stack.defaultVPC.vpc.vpcId),
      AvailabilityZone: 'us-east-1c',
      CidrBlock: '10.0.1.0/24',
      MapPublicIpOnLaunch: true,
      Tags: [
        {
          Key: 'aws-cdk:subnet-name',
          Value: 'load-balancer-subnet',
        },
        {
          Key: 'aws-cdk:subnet-type',
          Value: 'Public',
        },
        {
          Key: 'Name',
          Value:
            'LoadBalancerStack/load-balancer-vpc/load-balancer-subnetSubnet2',
        },
      ],
    });
  });

  test('Security group created', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      GroupDescription: 'LoadBalancerStack/allow-htpp-traffic-sg',
      SecurityGroupEgress: [
        {
          CidrIp: '0.0.0.0/0',
          Description: 'Allow all outbound traffic by default',
          IpProtocol: '-1',
        },
      ],
      SecurityGroupIngress: [
        {
          CidrIp: '0.0.0.0/0',
          Description: 'allow HTTP access from anywhere',
          FromPort: 80,
          IpProtocol: 'tcp',
          ToPort: 80,
        },
      ],
      VpcId: stack.resolve(stack.defaultVPC.vpc.vpcId),
    });
  });

  test('Intances created', () => {
    Array.of(1, 2).forEach((index) => {
      template.hasResourceProperties('AWS::EC2::Instance', {
        AvailabilityZone: 'us-east-1c',
        ImageId: {
          Ref: 'SsmParameterValueawsserviceamiamazonlinuxlatestamzn2amihvmx8664gp2C96584B6F00A464EAD1953AFF4B05118Parameter',
        },
        InstanceType: 't2.micro',
        SecurityGroupIds: [
          stack.resolve(stack.securityGropups.httpTrafic.securityGroupId),
        ],
        SubnetId: stack.resolve(stack.defaultVPC.vpc.publicSubnets[1].subnetId),
        Tags: [
          {
            Key: 'Name',
            Value: `LoadBalancerStack/web-server-${index}`,
          },
        ],
        UserData: {
          'Fn::Base64':
            '#!/bin/bash\n#! /bin/bash\nsudo yum update -y\nsudo yum install httpd -y\necho "<html><body><h1>Hello!!! I am Donald Torres!</h1></body></html>" > /var/www/html/index.html\nsystemctl start httpd\nsystemctl enable httpd',
        },
      });
    });
  });

  test('Load balancer created', () => {
    template.hasResourceProperties(
      'AWS::ElasticLoadBalancingV2::LoadBalancer',
      {
        LoadBalancerAttributes: [
          {
            Key: 'deletion_protection.enabled',
            Value: 'false',
          },
        ],
        Scheme: 'internet-facing',
        SecurityGroups: [
          stack.resolve(stack.securityGropups.httpTrafic.securityGroupId),
        ],
        Subnets: [
          stack.resolve(stack.defaultVPC.vpc.publicSubnets[0].subnetId),
          stack.resolve(stack.defaultVPC.vpc.publicSubnets[1].subnetId),
        ],
        Type: 'application',
      },
    );
  });

  test('Listener created', () => {
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', {
      DefaultActions: [
        {
          TargetGroupArn: stack.resolve(
            stack.targetGroup.targetGroup01.targetGroupArn,
          ),
          Type: 'forward',
        },
      ],
      LoadBalancerArn: stack.resolve(
        stack.loadBalancer.applicationLoadBalancer01.loadBalancerArn,
      ),
      Port: 80,
      Protocol: 'HTTP',
    });
  });

  test('Target group created', () => {
    console.log('--', stack.instances.instances.length);

    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
      HealthCheckIntervalSeconds: 30,
      HealthCheckPath: '/index.html',
      HealthyThresholdCount: 5,
      Port: 80,
      Protocol: 'HTTP',
      TargetGroupAttributes: [
        {
          Key: 'stickiness.enabled',
          Value: 'false',
        },
      ],
      Targets: [
        {
          Id: stack.resolve(stack.instances.instances[0].instanceId),
        },
        {
          Id: stack.resolve(stack.instances.instances[1].instanceId),
        },
      ],
      TargetType: 'instance',
      UnhealthyThresholdCount: 2,
      VpcId: stack.resolve(stack.defaultVPC.vpc.vpcId),
    });
  });
});
