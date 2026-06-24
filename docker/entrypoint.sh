#!/bin/sh
# Always sync quizzes and game config from the bundled seed into the persistent
# disk. Results are user data and are never touched.
SEED_DIR="/app/config-seed"
DATA_DIR="${CONFIG_PATH:-/app/data}"

echo "Syncing config seed from $SEED_DIR to $DATA_DIR ..."
mkdir -p "$DATA_DIR/quizz"

# Always overwrite quizzes (they come from the repo).
cp -r "$SEED_DIR/quizz/." "$DATA_DIR/quizz/"

# Only seed game.json if it doesn't exist yet (preserve manual changes).
if [ ! -f "$DATA_DIR/game.json" ]; then
  cp "$SEED_DIR/game.json" "$DATA_DIR/game.json"
fi

echo "Sync complete."

exec supervisord -c /etc/supervisord.conf
