FROM mcr.microsoft.com/devcontainers/base:bullseye

USER vscode

# Enable PostgreSQL installation
RUN sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

RUN sudo apt update && sudo apt install -y \
# Postgresql / psql
  postgresql \
# Python
  python3-dev \
# Other tooling
  vim iputils-ping

# Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Node (with nvm)
RUN curl --silent -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
RUN bash -ic "nvm install 20"
# Yarn
RUN bash -ic "corepack enable"
