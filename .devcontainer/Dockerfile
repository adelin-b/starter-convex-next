FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bookworm

# Set shell to use pipefail for safer piped commands
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash && \
    mv /root/.bun /usr/local/bun

# Install Convex CLI globally
RUN npm install -g convex

# Install additional tools and GitHub CLI
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    curl \
    git \
    vim \
    htop \
    jq \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get -y install --no-install-recommends gh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
WORKDIR /workspace

# The base image already has a 'node' user with UID 1000, so we'll use that
USER node

# Set up Bun for the node user (temporarily switch to root for this operation)
USER root
RUN cp -r /usr/local/bun /home/node/.bun && \
    chown -R node:node /home/node/.bun
USER node
RUN echo 'export BUN_INSTALL="$HOME/.bun"' >> /home/node/.bashrc && \
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> /home/node/.bashrc && \
    echo 'export BUN_INSTALL="$HOME/.bun"' >> /home/node/.zshrc && \
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> /home/node/.zshrc

# Create system-wide symlinks to bun and create bunx wrapper
USER root
RUN ln -sf /home/node/.bun/bin/bun /usr/local/bin/bun && \
    echo '#!/bin/bash' > /usr/local/bin/bunx && \
    echo 'exec bun x "$@"' >> /usr/local/bin/bunx && \
    chmod +x /usr/local/bin/bunx
USER node

# Set environment variables
ENV BUN_INSTALL="/home/node/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"
