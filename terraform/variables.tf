variable "aws_region" {
  description = "Target AWS region for infrastructure deployment"
  type        = string
  default     = "ap-south-1"
}

variable "cluster_name" {
  description = "Name of the AWS EKS cluster"
  type        = string
  default     = "opsdesk-eks"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "dev"
}
