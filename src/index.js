/**
 * gas-feed2notion
 * @copyright (c) 2022 hankei6km
 * @license MIT
 * see "LICENSE.txt" "OPEN_SOURCE_LICENSES.txt" of "gas-feed2notion.zip" in
 * releases(https://github.com/hankei6km/gas-grecent2html/releases)
 */

'use strict'

/**
 * Send items that are fetched via feed to Notion
 *
 * @param {string} apiKey
 * @param {FeedItemsOpts} opts
 * @returns {void}
 */
function send(apiKey, opts) {
  return _entry_point_.FeedToNotion.send(apiKey, opts)
}

/**
 * Get preset transformer for feed item
 *
 * @returns {Array<function>}
 */
function preseFeedTransformers() {
  return _entry_point_.FeedToNotion.preseFeedTransformers()
}

/**
 * Get preset transformer for param item
 *
 * @returns {Array<function>}
 */
function presetParamTransformers() {
  return _entry_point_.FeedToNotion.presetParamTransformers()
}

/**
 * Get wordsToMentionParamTeransFormer()
 *
 * @returns {function}
 */
function getWordsToMentionParamTeransFormer() {
  return _entry_point_.FeedToNotion.getWordsToMentionParamTeransFormer()
}
