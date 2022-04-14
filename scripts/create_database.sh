#!/bin/bash
set -e

TEMPLATE_SRC=scripts/template_src.json

if test ! -s "$NOTION_API_KEY}" && test ! -s "${PARENT_PAGE_ID}" && test ! -s "${DATABASE_NAME}" ; then

  TEMPLATE_JSON="$(jq '.parent.page_id |= env.PARENT_PAGE_ID' ${TEMPLATE_SRC} \
    | jq '.title[0].text.content |= env.DATABASE_NAME')"

  curl -sL 'https://api.notion.com/v1/pages/'"${PARENT_PAGE_ID}"'' \
    -H 'Notion-Version: 2022-02-22' \
    -H 'Authorization: Bearer '"${NOTION_API_KEY}"'' | jq -r '["user_id:" , .created_by.id] | @tsv'

  curl -sL --request POST 'https://api.notion.com/v1/databases/' \
    -H 'Authorization: Bearer '"${NOTION_API_KEY}"'' \
    -H 'Content-Type: application/json' \
    -H 'Notion-Version: 2022-02-22' \
    --data "${TEMPLATE_JSON}" | jq -r '["database_id:", .id] | @tsv'

else

  echo 'require env vars: NOTION_API_KEY PARENT_PAGE_ID DATABASE_NAME'
  exit 1

fi
