# OpsDesk — Incident Command Center 👋

Monitor, triage, and resolve production infrastructure incidents.

OpsDesk is a DevOps-focused incident management platform designed to demonstrate how a modern application moves from development to a containerized, tested, secured, deployed, and monitored environment.

The project combines a web application and backend API with automated CI/CD, infrastructure as code, Kubernetes orchestration, and observability tools to demonstrate an end-to-end DevOps workflow.

---

## Architecture

```mermaid
flowchart TD
    User["User / Operator"] --> Frontend["React + Vite Frontend"]
    Frontend --> Ingress["Kubernetes Ingress"]
    Ingress --> FrontSvc["Frontend Service"]
    Ingress --> BackSvc["Backend API Service"]

    FrontSvc --> FrontendPod["Frontend Pods"]
    BackSvc --> BackendPod["FastAPI Backend Pods"]

    BackendPod --> DB["PostgreSQL"]

    BackendPod --> Metrics["/metrics"]
    Prometheus["Prometheus"] --> Metrics
    Grafana["Grafana"] --> Prometheus

    Dev["Developer"] --> Git["Git / GitHub"]
    Git --> Actions["GitHub Actions"]
    Actions --> Tests["Automated Tests"]
    Actions --> Scan["Trivy Security Scan"]
    Scan --> Registry["GitHub Container Registry"]
    Registry --> Deploy["Kubernetes Deployment"]

    Terraform["Terraform"] --> Infra["AWS VPC + EKS"]
    Infra --> Deploy
    Deploy --> Helm["Helm"]
    Helm --> Ingress
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React, Vite | Web interface |
| Backend | Python, FastAPI | Backend APIs |
| Database | PostgreSQL | Relational data storage |
| ORM | SQLAlchemy | Database interaction |
| Migrations | Alembic | Database schema management |
| Testing | Pytest | Automated backend tests |
| Containers | Docker, Docker Compose | Containerization and local development |
| CI/CD | GitHub Actions | Automated testing and delivery |
| Security | Trivy | Container vulnerability scanning |
| Registry | GitHub Container Registry (GHCR) | Container image storage |
| Infrastructure as Code | Terraform | Infrastructure provisioning |
| Cloud | AWS VPC, EKS | Network and Kubernetes infrastructure |
| Orchestration | Kubernetes | Container deployment and management |
| Packaging | Helm | Reusable Kubernetes application deployment |
| Traffic Routing | Kubernetes Ingress | External application routing |
| Autoscaling | Horizontal Pod Autoscaler (HPA) | Workload scaling |
| Observability | Prometheus, Grafana | Metrics collection and visualization |

---

## Features

OpsDesk is designed around an incident-management workflow and a practical DevOps deployment pipeline.

- **Incident visibility:** A central interface for operational incident information.
- **Incident triage:** A foundation for organizing and investigating reported incidents.
- **Backend APIs:** FastAPI-based application endpoints.
- **Persistent storage:** PostgreSQL-backed data storage.
- **Containerized deployment:** Docker images for application services.
- **Automated quality checks:** Test execution in CI.
- **Container security scanning:** Trivy vulnerability checks.
- **Image publishing:** GHCR integration.
- **Infrastructure as Code:** Terraform-based AWS infrastructure configuration.
- **Kubernetes deployment:** Workload management using Kubernetes and Helm.
- **Traffic management:** Ingress-based application routing.
- **Autoscaling:** HPA configuration.
- **Observability:** Prometheus metrics collection and Grafana visualization.
- **Troubleshooting:** Practical investigation of Kubernetes deployment and Service failures.

---

# Part A — APPLICATION

## 1. Frontend

The frontend provides the web interface for interacting with OpsDesk.

It is built using React and Vite and communicates with the backend through HTTP APIs.

The frontend is containerized separately from the backend, allowing each component to be built and deployed independently.

## 2. Backend

The backend uses FastAPI to expose HTTP endpoints and provide the application's server-side functionality.

Key backend engineering components include:

- REST API development
- PostgreSQL integration
- SQLAlchemy ORM
- Alembic database migrations
- Pytest automated testing
- Health and readiness checks
- Prometheus-compatible metrics

The backend is designed to run as a containerized service inside the deployment environment.

### Health and readiness

Health checks help distinguish between a running container and an application that can serve requests.

- **Liveness:** Indicates whether the application process is healthy.
- **Readiness:** Indicates whether the application is ready to receive traffic.

Kubernetes can use these checks to improve workload management and reduce traffic sent to unavailable application instances.

### Metrics

The backend exposes a `/metrics` endpoint for Prometheus-compatible monitoring.

These metrics allow the monitoring stack to collect application-level information and make it available for querying and visualization.

## 3. Database

PostgreSQL provides relational data storage.

SQLAlchemy handles database interactions, while Alembic manages schema migrations.

Running migrations as part of the application lifecycle requires the database to be reachable before migration commands execute. Database readiness and application startup order are therefore important troubleshooting considerations.

---

# Part B — RUN LOCALLY

## 4. Docker Compose

### Requirements

- Docker Desktop or Docker Engine
- Docker Compose

Start the application stack:

```bash
docker compose up --build
```

The default local access points are:

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API documentation | http://localhost:8000/docs |
| Health endpoint | http://localhost:8000/health |
| Metrics endpoint | http://localhost:8000/metrics |

These URLs assume the corresponding ports are mapped in the Compose configuration.

Stop the stack:

```bash
docker compose down
```

Remove the Compose-managed database volume as well:

```bash
docker compose down -v
```

**Warning:** Removing volumes can permanently delete locally persisted database data.

---

## 5. Run the Backend Directly

### Requirements

- Python 3.12+
- A reachable PostgreSQL instance

Create and activate a virtual environment.

**Windows PowerShell:**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Linux / macOS:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Configure the database connection using the environment variable expected by the application:

```text
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE
```

Run database migrations:

```bash
alembic upgrade head
```

Start FastAPI:

```bash
uvicorn app.main:app --reload --port 8000
```

Open the API documentation:

http://localhost:8000/docs

---

# Part C — TESTING

## 6. Pytest

The backend test suite uses Pytest to validate application behavior.

Run the tests:

```bash
cd backend
pytest -q
```

Automated tests provide an early quality gate before container images are published.

```text
Code change
    |
    v
Automated tests
    |
    +---- Failure ----> Pipeline stops
    |
    v
Build application images
    |
    v
Security scan
    |
    v
Publish eligible images
```

The exact pipeline behavior depends on the configured GitHub Actions workflow.

---

# Part D — GIT AND GITHUB

## 7. Version Control

Git tracks source-code changes, while GitHub hosts the repository and supports collaboration and automated workflows.

Typical commands:

```bash
git status
git add .
git commit -m "feat: update incident management workflow"
git push origin main
```

Core concepts:

- **Repository:** Project source code and its history.
- **Commit:** A recorded checkpoint of changes.
- **Branch:** An independent line of development.
- **Pull request:** A proposed change for review.
- **GitHub Actions:** Automation triggered by repository events.

Small, descriptive commits make changes easier to review and troubleshoot.

---

# Part E — DOCKER

## 8. Backend Container

The backend Dockerfile defines how the FastAPI application is packaged into a container image.

A typical build process includes:

1. Selecting a Python base image.
2. Installing dependencies.
3. Copying application and migration files.
4. Configuring the runtime environment.
5. Starting the application server.

Build the image:

```bash
docker build -t opsdesk-backend:local ./backend
```

Run the container:

```bash
docker run --rm -p 8000:8000 opsdesk-backend:local
```

The database connection must be configured correctly for the container's network environment.

## 9. Frontend Container

The frontend can use a multi-stage build:

```text
Node.js build environment
          |
          v
     npm build
          |
          v
     Static assets
          |
          v
      Nginx image
```

A multi-stage build keeps build tooling separate from the final runtime image.

Build the frontend:

```bash
docker build -t opsdesk-frontend:local ./frontend
```

---

# Part F — CI/CD

## 10. GitHub Actions

The CI/CD pipeline automates quality checks and container delivery.

Conceptually, the workflow is:

```text
Push / Pull Request
        |
        v
  Test and Build
        |
        v
  Docker Build
        |
        v
  Trivy Security Scan
        |
        v
 Publish Images to GHCR
        |
        v
 Kubernetes Deployment
```

### Test and build

The workflow can run backend tests and build the frontend to detect errors before delivery.

### Container build

Backend and frontend images are built from their respective Dockerfiles.

### Security scanning

Trivy scans container images for known vulnerabilities.

### Image publishing

Images are published to GitHub Container Registry when the workflow's configured checks and publishing conditions are satisfied.

### Deployment

Helm and Kubernetes provide the deployment mechanism for the application.

For reproducibility, image tags based on Git commit SHAs are preferable to relying solely on mutable tags such as `latest`.

---

# Part G — SECURITY SCANNING

## 11. Trivy

Trivy is used to identify known vulnerabilities in container images.

A typical security gate checks for configured severity levels, such as HIGH and CRITICAL.

Container scanning is one layer of a broader security strategy.

| Security layer | Purpose |
|---|---|
| Static analysis | Identify potential source-code issues |
| Dependency scanning | Find vulnerable packages |
| Secret scanning | Detect accidentally committed credentials |
| Container scanning | Identify vulnerable image components |
| Runtime security | Monitor or restrict behavior during execution |

A successful scan does not guarantee that an application is completely secure. Findings must be reviewed and remediated appropriately.

---

# Part H — TERRAFORM

## 12. Infrastructure as Code

Terraform defines cloud infrastructure in configuration files.

The project's AWS infrastructure configuration covers the VPC and EKS deployment environment.

The intended infrastructure flow is:

```text
AWS
 |
 +-- VPC
 |    +-- Subnets
 |    +-- Routing
 |    +-- Internet connectivity
 |
 +-- EKS cluster
      +-- Kubernetes control plane
      +-- Worker nodes
```

Initialize and inspect the Terraform configuration:

```bash
cd terraform
terraform init
terraform validate
terraform plan
```

Apply infrastructure changes only when you intend to provision or modify AWS resources:

```bash
terraform apply
```

After deployment, configure `kubectl` to connect to the intended EKS cluster.

### Cost considerations

AWS resources such as EKS clusters, worker nodes, and NAT gateways can incur charges.

Review the Terraform plan before applying it. When the infrastructure is no longer needed, destroy the resources managed by the relevant configuration:

```bash
terraform destroy
```

Check the plan and dependencies before destroying resources, and verify the AWS account afterward to ensure that billable resources have been removed.

---

# Part I — KUBERNETES

## 13. Namespace

A Kubernetes namespace provides logical separation for application resources.

Create or apply the application namespace:

```bash
kubectl apply -f k8s/namespace.yaml
```

Inspect the namespace:

```bash
kubectl get namespaces
```

## 14. Helm

Helm packages Kubernetes manifests into reusable charts.

Deploy or upgrade OpsDesk:

```bash
helm upgrade --install opsdesk ./helm/taskboard \
  --namespace taskboard \
  --create-namespace
```

The chart path and release namespace above must match the current repository configuration. Rename the chart directory and release resources to `opsdesk` if you want the repository naming to be fully consistent.

Inspect releases:

```bash
helm list -n taskboard
```

Important Helm concepts include:

- Charts
- Values
- Templates
- Releases
- Upgrades
- Rollbacks

---

# Part J — KUBERNETES COMPONENTS

## 15. Deployments

A Deployment manages replicated application Pods and helps maintain the desired replica count.

```text
Deployment
    |
    v
ReplicaSet
    |
    +-- Pod
    +-- Pod
    +-- Pod
```

If a managed Pod fails, Kubernetes attempts to restore the desired state.

Inspect workloads:

```bash
kubectl get deployments -n taskboard
kubectl get pods -n taskboard
```

## 16. Services

Pods are replaceable, so their IP addresses can change.

A Kubernetes Service provides a stable network endpoint and routes traffic to Pods matching its selector.

```text
Frontend
   |
   v
Backend Service
   |
   v
Backend Pods
```

Inspect Services and endpoints:

```bash
kubectl get services -n taskboard
kubectl get endpoints -n taskboard
```

If a Service has no endpoints, verify that its selector matches the labels on the intended Pods.

## 17. PostgreSQL

PostgreSQL provides persistent application storage.

In Kubernetes, persistent storage can be provided through PersistentVolumeClaims and the corresponding storage provisioner.

For production AWS deployments, a managed database such as Amazon RDS may be preferable depending on availability, backup, maintenance, and operational requirements.

---

# Part K — INGRESS

## 18. Application Routing

An Ingress resource defines HTTP routing rules for traffic entering the cluster.

A typical routing layout is:

```text
Browser
   |
   v
Ingress Controller
   |
   +---- /       ----> Frontend Service
   |
   +---- /api    ----> Backend Service
```

Inspect Ingress resources:

```bash
kubectl get ingress -n taskboard
kubectl describe ingress -n taskboard
```

An Ingress resource alone does not handle traffic. A compatible Ingress Controller must be installed and configured, and DNS or local hostname resolution must direct traffic appropriately.

---

# Part L — HORIZONTAL POD AUTOSCALING

## 19. HPA

The Horizontal Pod Autoscaler adjusts the number of replicas based on configured metrics and scaling rules.

```text
Low resource utilization
          |
          v
    Fewer replicas

Higher utilization
          |
          v
    More replicas
```

Inspect autoscaling configuration:

```bash
kubectl get hpa -n taskboard
kubectl describe hpa -n taskboard
```

CPU-based autoscaling requires appropriate resource requests and a working metrics provider, such as Metrics Server.

A basic health request may not generate enough load to trigger scaling. A controlled load test is more useful when demonstrating autoscaling.

---

# Part M — MONITORING AND OBSERVABILITY

## 20. Prometheus

Prometheus collects time-series metrics from instrumented application endpoints.

OpsDesk's backend monitoring setup uses the FastAPI `/metrics` endpoint and a Kubernetes ServiceMonitor to describe the scraping configuration.

The monitoring flow is:

```text
FastAPI Backend
      |
      v
  /metrics
      |
      v
  Prometheus
      |
      v
    Grafana
```

Useful Prometheus checks include:

```promql
up
```

Shows whether discovered scrape targets are reporting as available.

```promql
http_requests_total
```

Queries the total HTTP request counter, provided the application exposes that metric.

```promql
rate(http_requests_total[5m])
```

Estimates the per-second request rate over a five-minute window.

Metric names and available labels depend on the application's instrumentation.

## 21. Grafana

Grafana visualizes metrics collected by Prometheus.

A monitoring dashboard can help investigate:

- Incoming HTTP request rates
- Application availability
- Request latency
- Error trends
- CPU and memory usage
- Workload scaling behavior

Access Grafana through the configured Kubernetes Service:

```bash
kubectl port-forward -n monitoring \
  svc/kube-prometheus-stack-grafana 3000:80
```

Then open:

http://localhost:3000

Use the credentials configured for the deployment. Do not commit passwords, tokens, or other secrets to the repository.

---

# Part N — TROUBLESHOOTING LAB

## 22. Broken Container Image

A Pod may enter `ImagePullBackOff` when Kubernetes cannot pull its configured image.

Inspect the Pod:

```bash
kubectl get pods -n troubleshooting-lab
kubectl describe pod <pod-name> -n troubleshooting-lab
kubectl get events -n troubleshooting-lab \
  --sort-by=.lastTimestamp
```

Investigation flow:

```text
Pod fails to start
       |
       v
ImagePullBackOff
       |
       v
Inspect Pod events
       |
       v
Check image name, tag,
registry access and credentials
       |
       v
Correct the configuration
```

## 23. Service Without Endpoints

A Service can exist and have a ClusterIP while routing to no Pods.

Inspect the Service and its endpoints:

```bash
kubectl get services -n troubleshooting-lab
kubectl get endpoints -n troubleshooting-lab
kubectl get pods -n troubleshooting-lab --show-labels
kubectl describe service <service-name> -n troubleshooting-lab
```

A common cause is a mismatch between the Service selector and Pod labels.

```text
Service selector
       |
       v
No matching Pod labels
       |
       v
No endpoints
       |
       v
Traffic cannot reach the workload
```

Correct the selector or Pod labels, then verify that endpoints are populated.

---

# Part O — FINAL DEMONSTRATION

## 24. Demo Workflow

A concise demonstration can follow the application from source code to monitoring.

1. **Application:** Open OpsDesk and demonstrate the implemented incident workflow.
2. **API:** Show the FastAPI documentation and relevant endpoints.
3. **Database:** Demonstrate persistent data storage.
4. **Git:** Show the source changes and commit history.
5. **CI:** Trigger or inspect a GitHub Actions run.
6. **Docker:** Show the frontend and backend container images.
7. **Security:** Demonstrate the Trivy scan results.
8. **Registry:** Show the published images in GHCR.
9. **Terraform:** Explain the infrastructure configuration and plan.
10. **Kubernetes:** Inspect Pods, Deployments, and Services.
11. **Helm:** Show the deployed release.
12. **Ingress:** Access the application through its configured route.
13. **HPA:** Inspect the autoscaler and its metrics.
14. **Monitoring:** Show Prometheus targets and Grafana panels.
15. **Troubleshooting:** Demonstrate a controlled failure and explain the investigation.

The end-to-end delivery workflow is:

```text
Source Code
     |
     v
Git / GitHub
     |
     v
GitHub Actions
     |
     v
Tests and Build
     |
     v
Trivy Security Scan
     |
     v
GHCR
     |
     v
Terraform Infrastructure
     |
     v
Kubernetes + Helm
     |
     v
Ingress and Autoscaling
     |
     v
Prometheus + Grafana
     |
     v
Operational Visibility
```

---

# Repository Structure

The following is the expected high-level layout based on the existing TaskBoard project structure. Update the chart path and any filenames to match the final OpsDesk repository.

```text
OpsDesk/
├── .github/
│   └── workflows/          # CI/CD workflows
├── frontend/               # React + Vite application
├── backend/
│   ├── app/                # FastAPI application
│   ├── tests/              # Pytest suite
│   └── alembic/            # Database migrations
├── helm/
│   └── taskboard/          # Existing Helm chart; rename if appropriate
├── k8s/                    # Kubernetes configuration
├── monitoring/             # Monitoring configuration
├── terraform/              # AWS infrastructure as code
├── troubleshooting/        # Failure-scenario manifests
├── scripts/                # Helper and load-testing scripts
├── docker-compose.yml      # Local application stack
└── README.md               # Project documentation
```

---

## Project Goal

OpsDesk brings application development and DevOps practices together in one project.

The goal is to demonstrate the complete lifecycle of a software application: developing and testing code, building and scanning containers, publishing images, deploying workloads, managing traffic and scaling, and collecting operational metrics for monitoring and troubleshooting.