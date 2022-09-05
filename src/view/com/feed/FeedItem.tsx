import React, {useMemo} from 'react'
import {observer} from 'mobx-react-lite'
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {bsky, AdxUri} from '@adxp/mock-api'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {FeedViewItemModel} from '../../../state/models/feed-view'
import {ComposePostModel} from '../../../state/models/shell'
import {Link} from '../util/Link'
import {PostDropdownBtn} from '../util/DropdownBtn'
import {s, colors} from '../../lib/styles'
import {ago} from '../../lib/strings'
import {AVIS} from '../../lib/assets'
import {useStores} from '../../../state'

export const FeedItem = observer(function FeedItem({
  item,
  onPressShare,
}: {
  item: FeedViewItemModel
  onPressShare: (_uri: string) => void
}) {
  const store = useStores()
  const record = item.record as unknown as bsky.Post.Record
  const itemHref = useMemo(() => {
    const urip = new AdxUri(item.uri)
    return `/profile/${item.author.name}/post/${urip.recordKey}`
  }, [item.uri, item.author.name])
  const itemTitle = `Post by ${item.author.name}`
  const authorHref = `/profile/${item.author.name}`

  const onPressReply = () => {
    store.shell.openModal(new ComposePostModel(item.uri))
  }
  const onPressToggleRepost = () => {
    item
      .toggleRepost()
      .catch(e => console.error('Failed to toggle repost', record, e))
  }
  const onPressToggleLike = () => {
    item
      .toggleLike()
      .catch(e => console.error('Failed to toggle like', record, e))
  }

  return (
    <Link style={styles.outer} href={itemHref} title={itemTitle}>
      {item.repostedBy && (
        <View style={styles.repostedBy}>
          <FontAwesomeIcon icon="retweet" style={styles.repostedByIcon} />
          <Text style={[s.gray4, s.bold, s.f13]}>
            Reposted by {item.repostedBy.displayName}
          </Text>
        </View>
      )}
      <View style={styles.layout}>
        <Link
          style={styles.layoutAvi}
          href={authorHref}
          title={item.author.name}>
          <Image
            style={styles.avi}
            source={AVIS[item.author.name] || AVIS['alice.com']}
          />
        </Link>
        <View style={styles.layoutContent}>
          <View style={styles.meta}>
            <Link
              style={styles.metaItem}
              href={authorHref}
              title={item.author.name}>
              <Text style={[s.f15, s.bold]}>{item.author.displayName}</Text>
            </Link>
            <Link
              style={styles.metaItem}
              href={authorHref}
              title={item.author.name}>
              <Text style={[s.f14, s.gray5]}>@{item.author.name}</Text>
            </Link>
            <Text style={[styles.metaItem, s.f14, s.gray5]}>
              &middot; {ago(item.indexedAt)}
            </Text>
            <View style={s.flex1} />
            <PostDropdownBtn
              style={styles.metaItem}
              itemHref={itemHref}
              itemTitle={itemTitle}>
              <FontAwesomeIcon
                icon="ellipsis-h"
                size={14}
                style={[s.mt2, s.mr5]}
              />
            </PostDropdownBtn>
          </View>
          <Text style={[styles.postText, s.f15, s['lh15-1.3']]}>
            {record.text}
          </Text>
          <View style={styles.ctrls}>
            <TouchableOpacity style={styles.ctrl} onPress={onPressReply}>
              <FontAwesomeIcon
                style={styles.ctrlIcon}
                icon={['far', 'comment']}
                size={14}
              />
              <Text style={s.f13}>{item.replyCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctrl} onPress={onPressToggleRepost}>
              <FontAwesomeIcon
                style={
                  item.myState.hasReposted
                    ? styles.ctrlIconReposted
                    : styles.ctrlIcon
                }
                icon="retweet"
                size={18}
              />
              <Text
                style={
                  item.myState.hasReposted ? [s.bold, s.green3, s.f13] : s.f13
                }>
                {item.repostCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctrl} onPress={onPressToggleLike}>
              <FontAwesomeIcon
                style={
                  item.myState.hasLiked ? styles.ctrlIconLiked : styles.ctrlIcon
                }
                icon={[item.myState.hasLiked ? 'fas' : 'far', 'heart']}
                size={14}
              />
              <Text
                style={item.myState.hasLiked ? [s.bold, s.red3, s.f13] : s.f13}>
                {item.likeCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctrl}
              onPress={() => onPressShare(item.uri)}>
              <FontAwesomeIcon
                style={styles.ctrlIcon}
                icon="share-from-square"
                size={14}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Link>
  )
})

const styles = StyleSheet.create({
  outer: {
    borderRadius: 10,
    margin: 2,
    marginBottom: 0,
    backgroundColor: colors.white,
    padding: 10,
  },
  repostedBy: {
    flexDirection: 'row',
    paddingLeft: 60,
  },
  repostedByIcon: {
    marginRight: 2,
    color: colors.gray4,
  },
  layout: {
    flexDirection: 'row',
  },
  layoutAvi: {
    width: 60,
    paddingTop: 5,
  },
  avi: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
  },
  layoutContent: {
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    paddingTop: 2,
    paddingBottom: 2,
  },
  metaItem: {
    paddingRight: 5,
  },
  postText: {
    paddingBottom: 5,
    fontFamily: 'Helvetica Neue',
  },
  ctrls: {
    flexDirection: 'row',
  },
  ctrl: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: 4,
    paddingRight: 4,
  },
  ctrlIcon: {
    marginRight: 5,
    color: colors.gray5,
  },
  ctrlIconReposted: {
    marginRight: 5,
    color: colors.green3,
  },
  ctrlIconLiked: {
    marginRight: 5,
    color: colors.red3,
  },
})
