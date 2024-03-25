#!/bin/sh

# From https://github.com/microsoft/vscode-dev-containers/tree/main/containers/docker-from-docker#final-fallback-socat

sudoIf() { if [ "$(id -u)" -ne 0 ]; then sudo "$@"; else "$@"; fi }

# Forward docker.sock to docker-host.sock
sudoIf rm -rf /var/run/docker.sock
NONROOT_USER=vscode
(
  (
    sudoIf socat UNIX-LISTEN:/var/run/docker.sock,fork,mode=660,user=${NONROOT_USER} UNIX-CONNECT:/var/run/docker-host.sock
  ) 2>&1 >> /tmp/vscr-docker-from-docker.log
) & > /dev/null

"$@"