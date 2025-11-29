import stashapi.log as log
from stashapi.stashapp import StashInterface
from stashapi.stashdb import StashDBInterface
import sys
import requests
import json

# custom prefixes to exclude
TAGS_URL = "https://tags.feederbox.cc"
SDB_ENDPOINT = "https://stashdb.org/graphql"

# helpers
def getStashTags():
  tags = stash.find_tags(fragment="id name aliases stash_ids { stash_id endpoint }")
  return tags

def updateTag(tagid, stashid):
  stash.update_tag({ "id": tagid, "stash_ids": { "stash_id": stashid, "endpoint": SDB_ENDPOINT} })

# definitions
json_input = json.loads(sys.stdin.read())
FRAGMENT_SERVER = json_input["server_connection"]
stash = StashInterface(FRAGMENT_SERVER)
stashdb = StashDBInterface({ "endpoint": SDB_ENDPOINT, stash: stash })


# tags
def syncFeederboxTags():
  remoteTags = requests.get(TAGS_URL + "/tags-export.json").json()
  localTags = getStashTags()
  for name, data in remoteTags.items():
    remoteStashID = data.get("stashID", None)
    if remoteStashID is None:
      continue
    localTag = next((tag for tag in localTags if tag["name"] == name), None)
    if localTag is None:
      log.debug(f"Tag '{name}' not found locally, skipping.")
      continue
    localStashIDs = [sid["stash_id"] for sid in localTag.get("stash_ids", [])]
    if remoteStashID in localStashIDs:
      log.debug(f"Tag '{name}' already has Stash ID '{remoteStashID}', skipping.")
      continue
    log.info(f"Updating tag '{name}' with Stash ID '{remoteStashID}'.")
    updateTag(localTag["id"], remoteStashID)

def syncStashDBExact():
  localTags = getStashTags()
  for tag in localTags:
    tagName = tag["name"]
    stashdbTag = stashdb.find_tag(tagName)
    if stashdbTag is None:
      log.debug(f"Tag '{tagName}' not found in StashDB, skipping.")
      continue
    remoteStashID = stashdbTag.get("id", None)
    localStashIDs = [sid["stash_id"] for sid in tag.get("stash_ids", [])]
    if remoteStashID in localStashIDs:
      log.debug(f"Tag '{tagName}' already has Stash ID '{remoteStashID}', skipping.")
      continue
    log.info(f"Updating tag '{tagName}' with Stash ID '{remoteStashID}'.")
    updateTag(tag["id"], remoteStashID)

if 'mode' in json_input['args']:
  PLUGIN_ARGS = json_input['args']["mode"]
  if 'feederbox' in PLUGIN_ARGS:
    syncFeederboxTags()
  elif 'stashdb-exact' in PLUGIN_ARGS:
    syncStashDBExact()
    pass