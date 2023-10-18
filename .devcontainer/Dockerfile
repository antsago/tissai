FROM mcr.microsoft.com/devcontainers/base:bullseye

USER vscode
SHELL ["/bin/bash", "-c"]

# Install nix
RUN sh <(curl -L https://nixos.org/nix/install) --no-daemon --yes

# Start with
# nix-shell -p yarn nodejs_20 python311Packages.sentence-transformers
