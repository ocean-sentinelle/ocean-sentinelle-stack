FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir fastapi uvicorn[standard] pyyaml
COPY app /app/app
EXPOSE 8787
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8787"]
