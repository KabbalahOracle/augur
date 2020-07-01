.PHONY: all ipfs-publish build-typescript build-ui build-contracts download-packages test clean python-deps virtualenv requests python3 yarn ipfs-envvars

all: build-ui

ipfs-publish: ipfs-envvars build-typescript python-deps
	python3 packages/augur-ui/support/dnslink-cloudflare.py -d augur.net -r _dnslink.v2-ipfs  -l $IPFS_HASH

build-typescript: download-packages
	yarn build

build-ui: build-typescript
	yarn workspace @augurproject/ui build

build-contracts: build-typescript venv
	. venv/bin/activate; \
	python3 -m pip install -r packages/augur-core/requirements.txt; \
	yarn workspace @augurproject/core build:contracts; \
	deactivate

download-packages: yarn
	yarn

test: build-typescript
	yarn test

clean:
	yarn clean


python-deps: venv requests

# NOTE: not phony
venv: python3 virtualenv
	python3 -m venv venv

virtualenv: python3
	python3 -m pip install virtualenv

requests: venv
	. venv/bin/activate; \
	python3 -m pip install requests




PYTHON3_INSTALLED := $(shell python3 --version >/dev/null 2>&1; echo $$?)
python3:
ifneq ($(PYTHON3_INSTALLED),0)
	$(error Must install python3)
endif

YARN_INSTALLED := $(shell yarn --version >/dev/null 2>&1; echo $$?)
yarn:
ifneq ($(YARN_INSTALLED),0)
	$(error Must install yarn)
endif

ipfs-envvars:
ifndef IPFS_HASH
	$(error Must specify IPFS_HASH)
endif
ifndef CF_API_KEY
	$(error Must specify CF_API_KEY)
endif
ifndef CF_API_EMAIL
	$(error Must specify CF_API_EMAIL)
endif
