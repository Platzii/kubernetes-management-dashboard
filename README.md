# Kubernetes Management Dashboard

To be used in combination with the [kubernetes-management-api](https://github.com/Platzii/kubernetes-management-api).

## How to run?

1. Build Docker image
```shell
docker build -t kubernetes-management-dashboard .
```

2. Run Docker container
```shell
docker run --name kubernetes-management-dashboard -d --restart always -p 80:80 kubernetes-management-dashboard:latest
```

This will run the **kubernetes-management-dashboard** container whenever the Docker daemon is started.
Dashboard is exposed on port 80.
