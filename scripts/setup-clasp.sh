#!/bin/bash
set -e

if test ! -z "${GAS_SCRIPT_ID}"; then
  jq '.scriptId = env.GAS_SCRIPT_ID' scripts/clasp_src.json \
    > .clasp.json
else
  echo "\$GAS_SCRIPT_ID is not defined"
  exit 1
fi
