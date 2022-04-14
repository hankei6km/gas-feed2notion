import {
  CreatePageParameters,
  QueryDatabaseParameters,
  QueryDatabaseResponse
} from '@notionhq/client/build/src/api-endpoints'
import { FeedToNotion } from './feed2notion'

const apiIUrlCreatePage = 'https://api.notion.com/v1/pages'
const apiUrlDabtabaseQuery = (database_id: string) =>
  `https://api.notion.com/v1/databases/${database_id}/query`
const apiVersion = '2022-02-22'

export function createPage(apiKey: string, param: CreatePageParameters) {
  UrlFetchApp.fetch(apiIUrlCreatePage, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': apiVersion
    },
    payload: JSON.stringify(param)
  })
}

export function getStoredItems(
  apiKey: string,
  database_id: string,
  after: number
): FeedToNotion.FilterItem['storedItems'] {
  const url = apiUrlDabtabaseQuery(database_id)
  let extAfter = after - 86400000 //  1 日余分に取得する
  if (extAfter < 0) {
    extAfter = 0
  }
  //const param: QueryDatabaseParameters = { // database_id が必須となているが、存在するとサーバー側でエラーにされる
  const param: Record<string, any> = {
    filter: {
      or: [
        {
          property: 'pubDate',
          date: {
            after: new Date(extAfter).toISOString()
          }
        }
      ]
    }
  }
  function* sitems(database_id: string) {
    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': apiVersion
      },
      payload: JSON.stringify(param)
    })
    let resQuery = JSON.parse(res.getContentText()) as QueryDatabaseResponse
    let resItems = resQuery.results
    while (resItems.length > 0) {
      for (const item of resItems) {
        yield item
      }
      resItems = []
      if (resQuery.next_cursor) {
        param.start_cursor = resQuery.next_cursor
        const res = UrlFetchApp.fetch(url, {
          method: 'post',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': apiVersion
          },
          payload: JSON.stringify(param)
        })
        resQuery = JSON.parse(res.getContentText()) as QueryDatabaseResponse
        resItems = resQuery.results
      }
    }
  }

  const storedItems: FeedToNotion.FilterItem['storedItems'] = {}
  for (const i of sitems(database_id)) {
    const item: any = i
    if (item.properties.guid) {
      const guid = item.properties.guid.rich_text
        .filter(({ type }: { type: string }) => type === 'text')
        .map(({ plain_text }: { plain_text: string }) => plain_text)
        .join()
      storedItems[guid] = item
    }
  }
  return storedItems
}
