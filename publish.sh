#!/bin/bash

HERE="$( cd "$(dirname "$0")" ; pwd -P )"
CONTENT_DIR_PATH="${HERE}/Publish"
SOURCE_DIR_PATH="${HERE}/../Publish"

if [ ! -d "${SOURCE_DIR_PATH}" ]; then
    echo "ERROR ::: ${SOURCE_DIR_PATH} not found!"
    exit 1
fi

echo pull content

if [ -d "${CONTENT_DIR_PATH}" ]; then
    rm -rf "${CONTENT_DIR_PATH}"
fi

rsync -avz "${SOURCE_DIR_PATH}/" "${CONTENT_DIR_PATH}"

echo sync
cd "${HERE}"

git add Publish 
git commit -m "blog content update: $(date '+%Y-%m-%d %H:%M')"
git ps

echo done.
