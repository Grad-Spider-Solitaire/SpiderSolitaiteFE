resource "aws_iam_role" "beanstalk_ec2" {
  assume_role_policy    = "{\"Statement\":[{\"Action\":\"sts:AssumeRole\",\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"ec2.amazonaws.com\"}}],\"Version\":\"2012-10-17\"}"
  description           = "Allows EC2 instances to call AWS services on your behalf."
  force_detach_policies = false
  managed_policy_arns   = ["arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker", "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier", "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"]
  max_session_duration  = 3600
  name                  = "aws-frontend-elasticbeanstalk-ec2"
  path                  = "/"
}

resource "aws_iam_instance_profile" "beanstalk__ec2" {
  name = "aws-frontend-elasticbeanstalk-ec2-profile"
  role = aws_iam_role.beanstalk_ec2.name
}

resource "aws_elastic_beanstalk_application" "nodejs_app" {
  name        = "spidersolitaire-fe-app"
  description = "A simple Node.js application for the Spider Solitaire frontend."
}

resource "aws_elastic_beanstalk_environment" "nodejs_env" {
  name                = "spidersolitaire-fe-env"
  application         = aws_elastic_beanstalk_application.nodejs_app.name
  solution_stack_name = "64bit Amazon Linux 2023 v6.1.4 running Node.js 20"
  tier                = "WebServer"

  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = data.aws_vpc.main.id
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.beanstalk_ec2.name
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", data.aws_vpc.main.public_subnets)
  }
  setting {
    namespace = "aws:ec2:instances"
    name      = "InstanceTypes"
    value     = "t3.micro"
  }
  setting {
    namespace = "aws:elasticbeanstalk:healthreporting:system"
    name      = "SystemType"
    value     = "basic"
  }
  setting {
    namespace = "aws:elasticbeanstalk:application"
    name      = "Application Healthcheck URL"
    value     = "/"
  }
  setting {
    namespace = "aws:elasticbeanstalk:command"
    name      = "Timeout"
    value     = "60"
  }
  setting {
    namespace = "aws:elasticbeanstalk:command"
    name      = "IgnoreHealthCheck"
    value     = "true"
  }
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }
  setting {
    namespace = "aws:elasticbeanstalk:managedactions"
    name      = "ManagedActionsEnabled"
    value     = "false"
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SERVER_PORT"
    value     = "3000"
  }
}
