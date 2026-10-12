output "cluster_name" {
  description = "EKS cluster identifier"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS API server endpoint"
  value       = module.eks.cluster_endpoint
}

output "vpc_id" {
  description = "VPC ID where EKS is provisioned"
  value       = module.vpc.vpc_id
}

output "configure_kubectl" {
  description = "Run this command in terminal to configure kubectl for the new EKS cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}
