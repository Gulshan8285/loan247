# LOAN247 AWS Migration

This app is a Next.js standalone server. The safest AWS path is:

1. Build a Docker image from this repo.
2. Push the image to Amazon ECR.
3. Run it on AWS App Runner or ECS Fargate.
4. Add the production environment variables from `.env.aws.example`.
5. Point `loan247.online` and `www.loan247.online` to the AWS service after health checks pass.
6. Remove the Vercel aliases/project only after AWS is verified live.

## Required AWS Inputs

- AWS account access with ECR, App Runner or ECS, IAM, ACM, and Route 53 permissions.
- Region, recommended: `ap-south-1`.
- A persistent `MONGODB_URI`.
- Firebase public and admin credentials.
- `ADMIN_PASSWORD`.

## Build And Push Image

```bash
AWS_REGION=ap-south-1 ECR_REPOSITORY=loan247 IMAGE_TAG=latest ./scripts/aws-ecr-push.sh
```

The script prints an ECR image URI like:

```text
123456789012.dkr.ecr.ap-south-1.amazonaws.com/loan247:latest
```

## Runtime Settings

Container port: `3000`

Health check path:

```text
/api/health
```

Required environment variables are listed in `.env.aws.example`.

## App Runner Notes

Use the ECR image URI as the source image. Configure:

- Port: `3000`
- Health check path: `/api/health`
- Environment variables: copy from `.env.aws.example` with real values
- Auto deploy: enabled if preferred

## DNS Cutover

After AWS service is healthy:

- Add/verify ACM certificate for `loan247.online` and `www.loan247.online`.
- Point the domain to AWS using Route 53 alias records or the App Runner custom domain DNS records.
- Verify:

```bash
curl -I https://www.loan247.online/api/health
curl -I https://www.loan247.online/
```

## GitHub To AWS Deploy

Production deploys run from GitHub Actions on every push to `main`.

- Workflow: `.github/workflows/deploy-aws-elastic-beanstalk.yml`
- AWS app: `loan247`
- AWS environment: `loan247-prod-alb`
- Region: `ap-south-1`
- Release bucket: `loan247-eb-336779059818-ap-south-1`

The workflow uses GitHub OIDC to assume the AWS IAM role
`loan247-github-actions-deploy`, so no long-lived AWS access key is stored in
GitHub.

## Vercel Removal

Remove Vercel only after AWS has served live traffic successfully:

- Remove `loan247.online` and `www.loan247.online` aliases from Vercel.
- Remove Vercel DNS records if Route 53 is authoritative.
- Delete or archive the Vercel project after a rollback window.
