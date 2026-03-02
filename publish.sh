#!/bin/bash

# Get current directory and define paths
HERE="$( cd "$(dirname "$0")" ; pwd -P )"
CONTENT_DIR_PATH="${HERE}"
SOURCE_DIR_PATH="${HERE}/.."

# Check if source directory exists
if [ ! -d "${SOURCE_DIR_PATH}" ]; then
    echo "ERROR ::: ${SOURCE_DIR_PATH} not found!"
    exit 1
fi

# Check if any files are provided as arguments
if [ $# -eq 0 ]; then
    echo "Usage: ./publish.sh <file_path_relative_to_source> ..."
    echo "Example: ./publish.sh some-post.md attachments/image.png"
    exit 1
fi

echo "--- Publishing specific files ---"

# Ensure content directory exists (do NOT remove it)
mkdir -p "${CONTENT_DIR_PATH}"

# Sync each provided file
for file in "$@"; do
    if [ -e "${SOURCE_DIR_PATH}/${file}" ]; then
        echo "Syncing: ${file}"
        # Use rsync with -R (relative) to preserve directory structure
        # We cd into source dir first so the relative path is correct
        (cd "${SOURCE_DIR_PATH}" && rsync -avzR "${file}" "${CONTENT_DIR_PATH}/")
    else
        echo "WARNING ::: ${file} not found in ${SOURCE_DIR_PATH}, skipping."
    fi
done

echo "--- Syncing to Git ---"
cd "${HERE}"

# Add the specific files to git
for file in "$@"; do
    # Only add if the file now exists in the destination
    if [ -e "${CONTENT_DIR_PATH}/${file}" ]; then
        git add "${file}"
    fi
done

# Check if there are any staged changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit."
else
    # Create a descriptive commit message
    COMMIT_MSG="blog content update: $(date '+%Y-%m-%d %H:%M')"
    if [ $# -le 3 ]; then
        # If few files, list them in the message
        COMMIT_MSG="${COMMIT_MSG} - $@"
    fi
    
    git commit -m "${COMMIT_MSG}"
    git ps
fi

echo "done."
