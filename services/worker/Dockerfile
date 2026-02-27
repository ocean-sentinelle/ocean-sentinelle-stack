FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir jsonschema pyyaml
COPY worker.py /app/worker.py
CMD ["python", "/app/worker.py"]
