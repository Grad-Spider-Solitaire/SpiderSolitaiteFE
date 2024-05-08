terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.39.1"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4.2"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
  default_tags {
    tags = {
      "owner"         = "luke.bradford@bbd.co.za"
      "created-using" = "terraform"
    }
  }
}