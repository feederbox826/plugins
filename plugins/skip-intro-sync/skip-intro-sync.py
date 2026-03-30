import sys
import json
import uuid
import requests
from stashapi.stashapp import StashInterface
import stashapi.log as log

json_input = json.loads(sys.stdin.read())

# recursive extraction
def extract(dict, keys):
    for key in keys:
        if dict is None:
            return None
        dict = dict.get(key, {})
    return dict

MODE = extract(json_input, ['args', 'mode'])
FRAGMENT_SERVER = json_input["server_connection"]
stash = StashInterface(FRAGMENT_SERVER)
config = stash.get_configuration()

# grab all studios
# filter for custom fields
# grab stashid
# submit
# set name if requested

STASHDB_ENDPOINT = "https://stashdb.org/graphql"

class SkipsDB:
    ENDPOINT = "https://skips.feederbox.cc"
    PLUGIN_ID = "skip-intro-sync"

    def __init__(self):
        self.session = requests.Session()
        self.user_id = self.get_user_id()
        self.set_user_id(self.user_id)

    def get_user_id(self) -> str:
        plugin_config = config.get("plugins", {}).get(self.PLUGIN_ID, {})
        existing_id = plugin_config.get("syncs_userid")
        if isinstance(existing_id, str) and existing_id:
            return existing_id
        # generate new uuidv4
        existing_id = str(uuid.uuid4())
        plugin_config["syncs_userid"] = existing_id
        stash.configure_plugin(self.PLUGIN_ID, plugin_config)
        return existing_id

    def set_user_id(self, user_id: str):
        self.session.headers.update({"Authorization": "Bearer " + user_id})

    def set_username(self):
        # get username
        plugin_config = config.get("plugins", {}).get(self.PLUGIN_ID, {})
        username = plugin_config.get("username")
        log.debug("Setting username to " + str(username))
        self.session.post(self.ENDPOINT + "/api/user/name", json={"name": username})

    def submit_stash(self):
        # get all studios with custom field
        studios = stash.find_studios({
            "custom_fields": {"field": "skip_first", "modifier": "NOT_NULL"},
            "stash_ids_endpoint": {"endpoint": STASHDB_ENDPOINT, "modifier": "NOT_NULL"}
        })
        studio_len = len(studios)
        current = 0
        for studio in studios:
            stashdb_id = next(x for x in studio.get("stash_ids", []) if x["endpoint"] == STASHDB_ENDPOINT)["stash_id"]
            skip_seconds = extract(studio, ["custom_fields", "skip_first"])
            # submit to skips-db
            self.session.post(self.ENDPOINT + "/api/time/submit", json={
                "studio_id": stashdb_id,
                "skip_seconds": skip_seconds
            })
            current += 1
            log.progress(current / studio_len)
            log.debug(f"Submitting studio {studio['name']} with skip_seconds {skip_seconds} and stashdb_id {stashdb_id}")

skips_client = SkipsDB()

if 'mode' in json_input['args']:
    PLUGIN_ARGS = json_input['args']["mode"]
    if 'submit' in PLUGIN_ARGS:
        skips_client.submit_stash()
    elif 'setname' in PLUGIN_ARGS:
        skips_client.set_username()
print("{}")