import { CreatePageParameters } from '@notionhq/client/build/src/api-endpoints'
import { FeedToNotion } from './feed2notion.js'
import {
  feedItems,
  fetchOgImageFeedTransformer,
  getFilterFeedTransformer
} from './util.js'

export const cardImageParamTeransFormer: FeedToNotion.ParamTransfomer =
  function* (
    ite: Generator<[CreatePageParameters, FeedToNotion.FeedItem, string]>
  ): Generator<[CreatePageParameters, FeedToNotion.FeedItem, string]> {
    for (const [param, item, xmlText] of ite) {
      const url = item.enclosure?.url
      if (url) {
        // body.cover = {
        //   type: 'external',
        //   external: {
        //     url
        //   }
        // }
        param.children?.splice(0, 0, {
          object: 'block',
          type: 'image',
          image: {
            external: { url }
          }
        })
      }
      yield [param, item, xmlText]
    }
  }

export function getWordsToMentionParamTeransFormer(
  words: (string | RegExp)[],
  userId: string
): FeedToNotion.ParamTransfomer {
  return function* (
    ite: Generator<[CreatePageParameters, FeedToNotion.FeedItem, string]>
  ): Generator<[CreatePageParameters, FeedToNotion.FeedItem, string]> {
    for (const [param, item, xmlText] of ite) {
      if (
        words.some(
          (w) =>
            item.title.match(w) ||
            item.description.match(w) ||
            item.feedName.match(w)
        )
      ) {
        param.children?.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'mention',
                mention: {
                  user: {
                    id: userId
                  }
                }
              }
            ]
          }
        })
      }
      yield [param, item, xmlText]
    }
  }
}

function* _genCreatePageParameters(
  opts: FeedToNotion.FeedItemsOpts,
  filter: FeedToNotion.FilterItem
): Generator<[CreatePageParameters, FeedToNotion.FeedItem, string]> {
  const feedTransfomers = opts.feedTransfomers || [fetchOgImageFeedTransformer]
  const filterTransformer = getFilterFeedTransformer(filter)
  let ite: Generator<[FeedToNotion.FeedItem, string]> = filterTransformer(
    feedItems(opts)
  )
  for (const i of feedTransfomers) {
    ite = i(ite)
  }
  for (const [item, xmlText] of ite) {
    const body: CreatePageParameters = {
      parent: {
        database_id: opts.database_id
      },
      properties: {
        title: {
          title: [{ type: 'text', text: { content: item.title } }]
        },
        tags: {
          multi_select: [
            {
              name: item.feedName
            }
          ]
        },
        guid: {
          rich_text: [{ type: 'text', text: { content: item.guid } }]
        },
        pubDate: {
          date: { start: item.pubDate }
        },
        link: {
          url: item.link
        },
        description: {
          rich_text: [{ type: 'text', text: { content: item.description } }]
        }
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: item.description
                }
              }
            ]
          }
        }
      ]
    }
    yield [body, item, xmlText]
  }
}

export function* genCreatePageParameters(
  opts: FeedToNotion.FeedItemsOpts,
  filter: FeedToNotion.FilterItem
): Generator<[CreatePageParameters, FeedToNotion.FeedItem, string]> {
  const paramTransfomers = opts.paramTransfomers || [cardImageParamTeransFormer]
  let ite: Generator<[CreatePageParameters, FeedToNotion.FeedItem, string]> =
    _genCreatePageParameters(opts, filter)
  for (const i of paramTransfomers) {
    ite = i(ite)
  }
  for (const item of ite) {
    yield item
  }
}
