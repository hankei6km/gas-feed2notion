import { CreatePageParameters } from '@notionhq/client/build/src/api-endpoints'
import { createPage, getStoredItems } from './notion.js'
import {
  cardImageParamTeransFormer,
  getWordsToMentionParamTeransFormer as _getWordsToMentionParamTeransFormer,
  genCreatePageParameters
} from './params.js'
import { fetchOgImageFeedTransformer } from './util.js'

export namespace FeedToNotion {
  /**
   * Feed object
   * @typedef {Object} Feed
   * @property {string} name - the name of feed
   * @property {string} url - the url of feed
   */

  type Feed = {
    name: string
    url: string
  }

  /**
   * Function to transform feed items
   * @typedef {(ite: Generator<[FeedItem,string]>) => Generator<[FeedItem,string]>} FeedTransfomer
   */

  /**
   * Function to transform param items
   * @typedef {(ite: Generator<[CreatePageParameters,FeedItem,string]>) => Generator<[CreatePageParameters,FeedItem,string]>} FeedTransfomer
   */

  export type FeedTransfomer = (
    ite: Generator<[FeedItem, string]>
  ) => Generator<[FeedItem, string]>

  export type ParamTransfomer = (
    ite: Generator<[CreatePageParameters, FeedItem, string]>
  ) => Generator<[CreatePageParameters, FeedItem, string]>

  /**
   * Options for send method.
   * @typedef {Object} FeedItemsOpts
   * @property {string} database_id
   * @property {Array<Feed>} feeds
   * @property {number} limit - limit the number of items of each feeds to send to notion
   * @property {number} [after] - item slection range(msec)
   * @property {Array<FeedTransfomer>} [Transfomers]
   */

  export type FeedItemsOpts = {
    database_id: string
    feeds: Feed[]
    limit: number
    after?: number
    feedTransfomers?: FeedTransfomer[]
    paramTransfomers?: ParamTransfomer[]
  }

  export type FeedItem = {
    feedName: string
    time: number
    title: string
    description: string
    guid: string
    link: string
    pubDate: string
    enclosure?: { url: string }
  }

  export type StoredItems = Record<string, any>
  export type FilterItem = {
    after: number
    storedItems: StoredItems
  }

  /**
   * Send items that are fetched via feed to Notion
   *
   * @param {string} apiKey
   * @param {FeedItemsOpts} opts
   * @returns {void}
   */
  export function send(apiKey: string, opts: FeedItemsOpts) {
    const after = opts.after !== undefined ? opts.after : Date.now() - 259200000 // 3 日前
    const storedItems = getStoredItems(apiKey, opts.database_id, after)
    for (const [item] of genCreatePageParameters(opts, {
      after,
      storedItems
    })) {
      createPage(apiKey, item)
    }
  }

  /**
   * Get preset transformer for feed item
   *
   * @returns {Array<FeedTransfomer>}
   */
  export function preseFeedTransformers() {
    return [fetchOgImageFeedTransformer]
  }

  /**
   * Get preset transformer for param item
   *
   * @returns {Array<ParamTransfomer>}
   */
  export function presetParamTransformers() {
    return [cardImageParamTeransFormer]
  }

  /**
   * Get wordsToMentionParamTeransFormer()
   *
   * @returns {ParamTransfomer}
   */
  export function getWordsToMentionParamTeransFormer() {
    return _getWordsToMentionParamTeransFormer
  }
}
