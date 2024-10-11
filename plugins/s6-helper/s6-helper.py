import stashapi.log as log
from stashapi.stashapp import StashInterface
import sys
import os
import json
import subprocess

UV_TARGET = os.environ.get('UV_TARGET')
PYTHON_REQS = "/config/requirements.txt"
# check for UV environment variables
if UV_TARGET is None:
    log.error("UV_TARGET missing, refusing to install requirements")
    sys.exit(1)

def install():
  args = ["uv", "pip", "install", "--system", "--target", UV_TARGET, "--requirement", "requirements.txt"]
  output = subprocess.run(args, capture_output=True, text=True)
  if output.returncode != 0:
    log.error("Failed to install requirements")
    log.error(output.stderr)
    return
  else:
    log.info(output.stderr)
    log.info("Installed dependencies")
    return

json_input = json.loads(sys.stdin.read())
FRAGMENT_SERVER = json_input["server_connection"]
stash = StashInterface(FRAGMENT_SERVER)

if 'mode' in json_input['args']:
    PLUGIN_ARGS = json_input['args']["mode"]
    if 'install' in PLUGIN_ARGS:
        install()