FROM mcr.microsoft.com/devcontainers/base:bullseye

USER vscode

# Setup repositories
# PostgreSQL
RUN sudo sh -c \
  'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' \
  && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
# Docker
RUN sudo install -m 0755 -d /etc/apt/keyrings \
  && sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
  && sudo chmod a+r /etc/apt/keyrings/docker.asc \
  && echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

RUN sudo apt update && sudo apt install -y \
# Postgresql / psql
  postgresql \
# Python
  python3-dev \
# Docker
  docker-ce-cli socat \
# Other tooling
  vim iputils-ping

# Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Node (with nvm)
RUN curl --silent -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
RUN bash -ic "nvm install 20"
# Yarn
RUN bash -ic "corepack enable"

# Entrypoint script
COPY ./entrypoint.sh /usr/local/share/
RUN sudo chmod +x /usr/local/share/entrypoint.sh
ENTRYPOINT [ "/usr/local/share/entrypoint.sh" ]
