import stashapi.log as log
from stashapi.stashapp import StashInterface
from stashapi.stashbox import StashBoxInterface
import sys
import json
from datetime import date

json_input = json.loads(sys.stdin.read())
FRAGMENT_SERVER = json_input["server_connection"]
STASHDB_ENDPOINT = 'https://stashdb.org/graphql'
stash = StashInterface(FRAGMENT_SERVER)

TAG_NAMES = ["18+", "20+", "30+", "40+", "50+", "60+", "70+"]
AGE_TAGS = [
    (18, 19, "18+"),
    (20, 29, "20+"),
    (30, 39, "30+"),
    (40, 49, "40+"),
    (50, 59, "50+"),
    (60, 69, "60+"),
    (70, 999, "70+")
]
EXISTING_TAG_DICT = {}

def find_tag_name(tagname, create=False):
    """
    Find a tag by name, optionally creating it if it doesn't exist.
    """
    cached = EXISTING_TAG_DICT.get(tagname)
    if cached:
        return cached
    tag = stash.find_tags(q=tagname)
    if tag:
        return tag[0]["id"]
    elif create:
        log.debug(f"Creating tag '{tagname}'")
        return stash.create_tag(tagname) 

def get_existing_tags():
    for tagname in TAG_NAMES:
        tag_id = find_tag_name(tagname)
        if tag_id:
            EXISTING_TAG_DICT[tagname] = tag_id

def add_tag(performer_id, tags, tag_id):
    old_tags = [t["id"] for t in tags]
    # check if tag already exists
    #if tag_id in old_tags:
    if False:
        return
    else:
        # remove existing tags
        old_tags = [t for t in old_tags if t not in EXISTING_TAG_DICT.values()]
        old_tags.append(tag_id)
        stash.update_performer({ "id": performer_id, "tag_ids": old_tags })

def get_age_performers(low, high, tagname):
    performer_filter = {
      "age": {
        "value": low, "value2": high,
        "modifier": "BETWEEN",
      }
    }
    result = stash.find_performers(f=performer_filter, fragment="id name tags { id }", get_count=True)
    [count, performers] = result
    if count == 0:
        log.debug(f"No performers found in range {low}-{high}")
        return
    log.debug(f"Found {count} performers in range {low}-{high}")
    # find/ create tag
    tag_id = find_tag_name(tagname, create=True)
    for idx, performer in enumerate(performers):
        add_tag(performer["id"], performer['tags'], tag_id)

def get_stashdb_performers():
    """
    fetch all performers with birth_year
    scene ccount optional since we pull from stashdb
    """

def get_local_performers():
    """
    fetch all performers with birth_year and scene count
    """
    result = stash.find_performers(
        f={
            "birth_year": {"modifier": "NOT_NULL", "value": 0},
            "scene_count": {"modifier": "GREATER_THAN", "value": 0}
        },
        fragment="id name birthdate career_length",
        get_count=True
    )
    [count, performers] = result
    log.debug(f"Found {count} performers with birth_year and scene count")
    return count, performers

def age_local_performer(performer_id, birth_date, career_length):
    # find remaster tag
    remaster_tag_id = find_tag_name("Remaster")
    result = stash.find_scenes(
        f={
          "performers": { "modifier": "INCLUDES", "value": performer_id },
          "tags": { "modifier": "EXCLUDES", "value": remaster_tag_id }
        },
        filter={ "page": 1, "direction": "DESC", "sort": "date" },
        fragment="date"
    )
    last_date = date.fromisoformat(result[0]['date'])
    career_end = career_length.split("-")[-1]
    if career_end:
        career_end_date = date(int(career_end), 12, 31)
        # test if last_date is >1y after career_end
        idx = 1
        try:
            while last_date > career_end_date:
                last_date = date.fromisoformat(result[idx]['date'])
                idx += 1
        except IndexError:
            log.warn(f"Last date {last_date} is after career end {career_end_date}, using career end date instead")
            last_date = career_end_date
    calculate_add_age(performer_id, birth_date, last_date)

def calculate_add_age(performer_id, birth_date, last_dateobj):
    performer_birth_date = date.fromisoformat(birth_date)
    age = last_dateobj - performer_birth_date
    years = age.days // 365
    # add appropiate age tag
    tagname = match_age_tag(years)
    if tagname:
        performer = stash.find_performer(performer_id, fragment="name tags { id }")
        log.debug(f"Adding age tag '{tagname}' to performer {performer['name']} (age: {years})")
        tag_id = find_tag_name(tagname, create=True)
        add_tag(performer_id, performer['tags'], tag_id)

def init_stashdb():
    stashbox_config = stash.get_stashbox_connection(STASHDB_ENDPOINT)
    stashdb = StashBoxInterface(stashbox_config)
    return stashdb

def age_stashdb_performer(performer_id, birth_date):
    # pull stashid
    performer_stashids = stash.find_performer(performer_id, fragment="stash_ids { endpoint stash_id }")
    stashdb_stashid = [stashid for stashid in performer_stashids['stash_ids'] if stashid['endpoint'] == STASHDB_ENDPOINT][0]['stash_id']
    if not stashdb_stashid:
        log.warn(f"Performer {performer_id} has no stashdb stash_id, skipping")
        return
    scene_date = stashdb.find_scenes(
        scene_query={
            "performers": { "modifier": "INCLUDES", "value": stashdb_stashid },
            "tags": { "modifier": "EXCLUDES", "value": "faf494d6-9092-4dd5-86d7-0978c596b547" }, # Remaster tag ID
            "sort": "DATE",
            "direction": "DESC",
            "per_page": 1
        },
        fragment="date",
        pages=1
    )
    last_date = date.fromisoformat(scene_date[0]['date'])
    calculate_add_age(performer_id, birth_date, last_date)

def match_age_tag(age):
    for low, high, tagname in AGE_TAGS:
        if low <= age <= high:
            return tagname
    return None

# main entry point
if "mode" in json_input["args"]:
    PLUGIN_MODE = json_input["args"]["mode"]
    get_existing_tags()
    if "real-age" == PLUGIN_MODE:
        log.debug("Running in real-age mode")
        for low, high, tagname in AGE_TAGS:
            get_age_performers(low, high, tagname)
    elif "scene-age-stash" == PLUGIN_MODE:
        log.debug("Running in scene-age-stash mode")
        count, performers = get_local_performers()
        for idx, performer in enumerate(performers):
            age_local_performer(performer["id"], performer["birthdate"], performer["career_length"])
            log.progress(idx/count)
    elif "scene-age-stashdb" == PLUGIN_MODE:
        log.debug("Running in scene-age-stashdb mode")
        stashdb = init_stashdb()
        count, performers = get_local_performers()
        for idx, performer in enumerate(performers):
            age_stashdb_performer(performer["id"], performer["birthdate"])
            log.progress(idx/count)