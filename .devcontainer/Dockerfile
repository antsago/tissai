FROM mcr.microsoft.com/devcontainers/base:bullseye

USER vscode
SHELL ["/bin/bash", "-c"]

# Install nix
RUN sh <(curl -L https://nixos.org/nix/install) --no-daemon --yes

# Install dependencies
RUN /home/vscode/.nix-profile/bin/nix-env -iA nixpkgs.python311Packages.sentence-transformers
