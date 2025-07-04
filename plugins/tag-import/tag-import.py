import stashapi.log as log
from stashapi.stashapp import StashInterface
import base64
import re
import sys
import requests
import json
from datetime import datetime, timezone

CREATE_MISSING_TAGS = False;
DOWNLOAD_VIDEO_TAGS = False;
ALLOW_IGNORE_TAGS = False;
REFRESH = False;
FORCE_OVERWRITE = False;
# custom prefixes to exclude
EXCLUDE_PREFIX = ["r:", "c:", ".", "stashdb", "Figure", "["]
BASEURL = "https://tags.feederbox.cc"


# If you want the full archive, please contact me directly
# https://feederbox.cc

# thumb - 256x256
# small - 512x512
# large - 1000x1000
# optimized - full resolution webp, but lightly compressed
# original - Please no. This will bust my cache and the images go up to 5000x5000 @14MB ea

QUALITY = "optimized";

tagserv_s = requests.Session()
# header not for analytics, but for bot protection bypass
# shouldn't affect anything if you remove it
tagserv_s.headers.update({
  "User-Agent": "feederbox/tag-import",
  "Connection": "keep-alive"
})

# helpers
def getStashTags():
  tags = stash.find_tags(fragment="id name aliases image_path parents { id }")
  return tags

def jpgStrip(filename):
  return re.sub(r'\.\w+$', ".jpg", filename)

def processFilename(media):
  hasImg = media["img"] != ""
  hasVid = media["vid"] != ""
  # if DOWNLOAD_VIDEO_TAGS
  if (DOWNLOAD_VIDEO_TAGS and hasVid):
    return f"/media/original/{media['vid']}";
  # video not desired, but img is available
  elif (hasImg):
    return f"/media/{QUALITY}/{media['img']}";
  # only video, grab thumb of vid
  else:
    return f"/media/{QUALITY}/{jpgStrip(media['vid'])}";

def url_b64(filename):
  data = base64.b64encode(tagserv_s.get(BASEURL+filename).content)
  if (filename.endswith(".webm")):
    mimetype = "video/webm"
  else:
    mimetype = "image/" + filename.split(".")[-1]
  return f"data:{mimetype};base64,{data.decode('utf-8')}"

def updateTag(tagid, filename):
  # get tag
  tag = stash.find_tag(int(tagid))
  # get parents
  if tag["parents"] is None:
    parents = [fbox_tag_id]
  else:
    parents = list(map(lambda x: x["id"], tag["parents"]))
    # add [fbox-tag] to parents
    parents.append(fbox_tag_id)
    parents = list(set(parents))
  image = url_b64(filename)
  # update tag with b64 image
  stash.update_tag({ "id": tagid, "image": image, "parent_ids": parents })

def find_tag_videos():
  plugins = stash.call_GQL("query { plugins { id }}")
  log.debug(plugins)
  if any (plugin['id'] == "tag-video" for plugin in plugins["plugins"]):
    return True

# main function

def syncTags():
  # precheck
  if QUALITY == "original":
    log.error("original quality is enabled, please contact me for fullsize archives")
  # pull remote tag list
  remoteTagReq = tagserv_s.get(BASEURL + "/tags-export.json")
  # check for errors
  if remoteTagReq.status_code != 200:
    log.error("failed to fetch remote tag list")
    log.error("status code: " + str(remoteTagReq.text))
    return
  remoteTags = remoteTagReq.json()
  # iterate on remote tags
  for name, media in remoteTags.items():
    # skip prefixes
    for PREFIX in EXCLUDE_PREFIX:
      if name.startswith(PREFIX):
        continue
    # possibly allow ignore tags
    if (ALLOW_IGNORE_TAGS and media.get("ignore") == True):
      log.info("allowing ignore tag: " + name)
      localTag = stash.find_tag(name, create=False)
    elif (media.get("ignore") == True):
      log.info("ignoring tag: " + name)
      continue
    else:
      # search in local tags, optionally create
      localTag = stash.find_tag(name, create=CREATE_MISSING_TAGS)
    # if not found, skip
    if localTag is None:
      continue
    # start actual overwriting
    isDefault = "default=true" in localTag["image_path"]
    fboxTag = localTag["parents"] is not None and fbox_tag_id in list(map(lambda x: x["id"], localTag["parents"]))
    # if default, update
    if isDefault:
      log.info("updating default tag: " + name)
      filename = processFilename(media)
      updateTag(localTag.get("id"), filename)
      continue
    # handle existing tags
    elif fboxTag:
      filename = processFilename(media)
      if REFRESH:
        # get updated_at time of tag
        tagUpdatedAt = datetime.strptime(localTag["updated_at"], '%Y-%m-%dT%H:%M:%S%z')
        # get updated_at time of media
        mediaLastModified = tagserv_s.head(BASEURL+filename).headers["Last-Modified"]
        mediaUpdatedAt = datetime.strptime(mediaLastModified, '%a, %d %b %Y %H:%M:%S %Z').replace(tzinfo=timezone.utc)
        # compare
        if mediaUpdatedAt > tagUpdatedAt:
          log.info("refreshing existing tag: " + name)
          updateTag(localTag.get("id"), filename)
          continue
        else:
          log.debug("tag is up to date: " + name)
          continue
      elif FORCE_OVERWRITE:
        log.info("force updating existing tag: " + name)
        updateTag(localTag.get("id"), filename)
        continue
  # end
  log.info("tag sync complete")

# tasks
json_input = json.loads(sys.stdin.read())
FRAGMENT_SERVER = json_input["server_connection"]
stash = StashInterface(FRAGMENT_SERVER)

# create [fbox-tag] tag to mark imported tags
fbox_tag_id = stash.find_tag("[fbox-tag]", create=True).get("id")

config = stash.get_configuration()
settings = config["plugins"].get("tag-import")

if (settings):
  DOWNLOAD_VIDEO_TAGS = settings.get('video-tags', False)
  CREATE_MISSING_TAGS = settings.get('create-missing', False)
  ALLOW_IGNORE_TAGS = settings.get('allow-ignore', False)

# check for tag-video before downloading videos
if DOWNLOAD_VIDEO_TAGS and not find_tag_videos():
  log.error("tag-video plugin not found, disabling video download")
  DOWNLOAD_VIDEO_TAGS = False

if 'mode' in json_input['args']:
  PLUGIN_ARGS = json_input['args']["mode"]
  if 'get' in PLUGIN_ARGS:
    syncTags()
  elif 'refresh' in PLUGIN_ARGS:
    REFRESH = True
    syncTags()
  elif 'force' in PLUGIN_ARGS:
    FORCE_OVERWRITE = True
    syncTags()