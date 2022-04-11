#!/bin/bash
set -e

# https://zenn.dev/link/comments/cec78c15bb2ec5 

SECRETS=(
  "ACCESS_TOKEN"
  "SCOPE" # scope もシークレットにした方がよい？
  "ID_TOKEN"
  "EXPIRY_DATE" # ついでに.
  "REFRESH_TOKEN"
  "CLIENT_ID"
  "CLIENT_SECRET"
)

# SECRET のチェック.
# 定義されていなければ何もしない.
for SECRET in "${SECRETS[@]}"; do
  if test -z "${!SECRET}" ; then
    # echo "\$${SECRET} is not defined"
    # exit 1
    echo "Skip .clasptc.json generation"
    exit 0
  fi
done


jq '.token.access_token = env.ACCESS_TOKEN' scripts/clasprc_src.json \
  | jq '.token.scope = env.SCOPE' \
  | jq '.token.id_token = env.ID_TOKEN' \
  | jq '.token.expiry_date = env.EXPIRY_DATE' \
  | jq '.token.expiry_date |= tonumber' \
  | jq '.token.refresh_token = env.REFRESH_TOKEN' \
  | jq '.oauth2ClientSettings.clientId = env.CLIENT_ID' \
  | jq '.oauth2ClientSettings.clientSecret = env.CLIENT_SECRET' \
  > "${HOME}/.clasprc_tmp.json"
