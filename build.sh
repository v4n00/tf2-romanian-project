#!/bin/bash

# Set variables
OUTPUT_DEST="./output/tf/custom/tf2-ro-pack"
LOGO_SOURCE="./logo/new_tf2_logo.vtf"
LOGO_DEST="$OUTPUT_DEST/materials/logo"
SOUND_SOURCE="./voicelines"
SOUND_DEST="$OUTPUT_DEST/sound/vo"
LOCALIZATION_SOURCE="./localization"
LOCALIZATION_DEST="./output/tf/resource"

# Remove existing directory if it exists
if [ -d "./output/tf" ]; then
    rm -rf "./output/tf"
fi

# Create output directories
mkdir -p "$LOGO_DEST"
mkdir -p "$SOUND_DEST"
mkdir -p "$SOUND_DEST/compmode"
mkdir -p "$OUTPUT_DEST/sound/ui"
mkdir -p "$LOCALIZATION_DEST"

# Copy the logo
cp "$LOGO_SOURCE" "$LOGO_DEST"

# Process sound files and adjust volume
find "$SOUND_SOURCE" -type f -name "*.mp3" | while read -r file; do
    ffmpeg -y -i "$file" -af "volume=3dB" "$SOUND_DEST/$(basename "$file")"
done

# Process compmode sound files
find "$SOUND_SOURCE/administrator/responses/compmode" -type f -name "*.mp3" | while read -r file; do
    ffmpeg -y -i "$file" -af "volume=3dB" "$SOUND_DEST/compmode/$(basename "$file")"
done

# Process misc sound files into the compmode directory
find "$SOUND_SOURCE/administrator/responses/misc" -type f -name "*.mp3" | while read -r file; do
    ffmpeg -y -i "$file" -af "volume=3dB" "$SOUND_DEST/compmode/$(basename "$file")"
done

# Process UI sound files
find "$SOUND_SOURCE/administrator/responses/ui" -type f -name "*.mp3" | while read -r file; do
    ffmpeg -y -i "$file" -af "volume=3dB" "$OUTPUT_DEST/sound/ui/$(basename "$file")"
done

# Copy localization files
cp -r "$LOCALIZATION_SOURCE"/* "$LOCALIZATION_DEST"
