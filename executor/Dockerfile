# Use Ubuntu base image
FROM ubuntu:20.04

# Set environment variable to auto-accept prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies including Rust
RUN apt-get update && \
    apt-get install -y python3 python3-pip gcc g++ curl && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Add cargo bin to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

# Create a working directory
RUN mkdir -p /home/runner
WORKDIR /home/runner

CMD ["bash"]
