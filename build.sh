#!/bin/bash

OUTPUT_DEST="./output/tf2-ro-pack"
LOGO_SOURCE="./logo/new_tf2_logo.vtf"
SOUND_SOURCE="./voicelines"
NEW_VOICELINES_SOURCE="./tf2rop-app/dist/workdir/"
LOGO_DEST="$OUTPUT_DEST/materials/logo"
SOUND_DEST="$OUTPUT_DEST/sound/vo"
VOLUME_ADJUST="3dB"

[[ -d "$OUTPUT_DEST" ]] && rm -rf "$OUTPUT_DEST"

mkdir -p "$LOGO_DEST"
mkdir -p "$SOUND_DEST"
mkdir -p "$SOUND_DEST/compmode"
mkdir -p "$OUTPUT_DEST/sound/ui"

cp "$LOGO_SOURCE" "$LOGO_DEST"

# voice lines

find "$NEW_VOICELINES_SOURCE" -type f \( -name "*.mp3" -o -name "*.wav" \) | while read -r file; do
    relative_path="${file#$NEW_VOICELINES_SOURCE}" # Get relative path
    target_dir="$SOUND_DEST/$(dirname "$relative_path")" # Recreate directory structure
    mkdir -p "$target_dir" # Ensure target directory exists
    ffmpeg -y -i "$file" -af "volume=$VOLUME_ADJUST" "$target_dir/$(basename "$file")"
done

find "$NEW_VOICELINES_SOURCE" -type f -name "Heavy_*" | while read -r file; do
    relative_path="${file#$NEW_VOICELINES_SOURCE}" # Get relative path
    target_dir="$SOUND_DEST/$(dirname "$relative_path")" # Recreate directory structure
    mkdir -p "$target_dir" # Ensure target directory exists
    ffmpeg -y -i "$file" -af "volume=6dB" "$target_dir/$(basename "$file")"
done

find "$SOUND_SOURCE" -type f -name "*.mp3" | while read -r file; do
    ffmpeg -y -i "$file" -af "volume=$VOLUME_ADJUST" "$SOUND_DEST/$(basename "$file")"
done

find "$SOUND_SOURCE/administrator/responses/compmode" -type f -name "*.mp3" | while read -r file; do
    ffmpeg -y -i "$file" -af "volume=$VOLUME_ADJUST" "$SOUND_DEST/compmode/$(basename "$file")"
done

find "$SOUND_SOURCE/administrator/responses/misc" -type f -name "*.mp3" | while read -r file; do
    ffmpeg -y -i "$file" -af "volume=$VOLUME_ADJUST" "$SOUND_DEST/compmode/$(basename "$file")"
done

find "$SOUND_SOURCE/administrator/responses/ui" -type f -name "*.mp3" | while read -r file; do
    ffmpeg -y -i "$file" -af "volume=$VOLUME_ADJUST" "$OUTPUT_DEST/sound/ui/$(basename "$file")"
done