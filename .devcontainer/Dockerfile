# v0.7.3 (NC-55): the base was `vscode/devcontainers/javascript-node:0-14`.
# Two things forced a change when Node moved to 24:
#   - that image family is retired, and
#   - its maintained successor (`devcontainers/javascript-node:1-*`) stops at
#     Node 22 — there is no Node 24 tag to move to.
# So this builds on the official Node image instead. It ships the same non-root
# `node` user, but none of the devcontainer extras, so `sudo` and `git` are
# installed explicitly below.

# [Choice] Node.js version: 24-bookworm-slim, 22-bookworm-slim (keep in sync with
# .devcontainer/devcontainer.json, cms/Dockerfile and .github/workflows/ci.yml)
ARG VARIANT="24-bookworm-slim"
FROM node:${VARIANT}

# Configure apt
ENV DEBIAN_FRONTEND=noninteractive

# Installing additional OS Packages
# `linuxbrew-wrapper` was dropped from Debian bookworm, so the old package list
# fails outright on this base. The only thing brew was used for here was the two
# zsh plugins, and bookworm ships both as apt packages — installed directly.
# `sudo`, `git` and `ca-certificates` came from the old MS base image.
RUN apt-get update \
    && apt-get -y install --no-install-recommends \
    ca-certificates \
    curl \
    git \
    gnupg \
    locales \
    sudo \
    zsh \
    zsh-autosuggestions \
    zsh-syntax-highlighting \
    wget \
    tree \
    jq \
    fonts-powerline \
    # set up locale
    && sed -i 's/^# *en_US.UTF-8/en_US.UTF-8/' /etc/locale.gen \
    && locale-gen en_US.UTF-8 && fc-cache -vf \
    && rm -rf /var/lib/apt/lists/*

ENV DEBIAN_FRONTEND=dialog
ENV SHELL=/bin/zsh

# Use Yarn 2
RUN yarn set version berry

ARG USER="node"
ARG GROUP="node"

# Passwordless sudo for the non-root user — the old MS base set this up for us.
RUN echo "${USER} ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/${USER} \
    && chmod 0440 /etc/sudoers.d/${USER}

USER ${USER}

# Make variables available in Shell Env
ENV USER=${USER}
ENV GROUP=${GROUP}

# Install Oh-my-ZSH
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true

# Install powerlevel10k
RUN git clone https://github.com/romkatv/powerlevel10k.git /home/${USER}/.oh-my-zsh/custom/themes/powerlevel10k

ADD --chown=${USER}:${GROUP} .zshrc /home/${USER}

# The zsh plugins now come from apt above (see the note there), so there is no
# brew step left to run.
