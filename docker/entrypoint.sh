#!/bin/sh
# On first start with an empty persistent disk, seed it with the bundled config.
# On subsequent starts the disk already has data (including saved results), so
# we leave it untouched.
SEED_DIR="/app/config-seed"
DATA_DIR="${CONFIG_PATH:-/app/data}"

if [ ! -d "$DATA_DIR/quizz" ]; then
  echo "Seeding config from $SEED_DIR to $DATA_DIR ..."
  mkdir -p "$DATA_DIR"
  cp -r "$SEED_DIR/." "$DATA_DIR/"
  echo "Seed complete."
else
  echo "Persistent data already present at $DATA_DIR, skipping seed."
fi

exec supervisord -c /etc/supervisord.conf
