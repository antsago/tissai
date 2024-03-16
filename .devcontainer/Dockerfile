FROM mcr.microsoft.com/devcontainers/base:bullseye

# Install nix
RUN curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install linux \
  --extra-conf "sandbox = false" \
  --init none \
  --no-confirm
ENV PATH="${PATH}:/nix/var/nix/profiles/default/bin"
RUN chown -R vscode:vscode /nix
