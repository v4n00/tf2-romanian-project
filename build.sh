#!/bin/bash

LOGO_SOURCE="./logo/new_tf2_logo.vtf"
VOICELINES_SOURCE="./tf2rop-app/dist/workdir"
OUTPUT_DEST="./output/tf2-ro-pack"
LOGO_DEST="$OUTPUT_DEST/materials/logo"
SOUND_DEST="$OUTPUT_DEST/sound/vo"
INSTALL_LOCATION="${HOME}/.local/share/Steam/steamapps/common/Team Fortress 2/tf/custom"

# setup
[[ -d "$OUTPUT_DEST" ]] && rm -rf "$OUTPUT_DEST"
[[ -f "$OUTPUT_ZIP" ]] && rm -f "$OUTPUT_ZIP"

# logo
mkdir -p "$LOGO_DEST"
cp "$LOGO_SOURCE" "$LOGO_DEST"

# voice lines
find "$VOICELINES_SOURCE" -type f \( -name "*.mp3" -o -name "*.wav" \) | while read -r file; do
    output_file="${SOUND_DEST}${file#$VOICELINES_SOURCE}"
    echo "Processing file: $output_file"
    mkdir -p "$(dirname "$output_file")"
    ffmpeg -i "$file" -af loudnorm=I=-8:LRA=18:TP=-1.5,volume=3dB -ar 44100 "$output_file" > /dev/null 2>&1
done

# package and install
cd "./output" && zip -r "tf2-ro-pack.zip" "tf2-ro-pack/" > /dev/null && cd -
[[ -d "$INSTALL_LOCATION" ]] && rm -rf "$INSTALL_LOCATION/tf2-ro-pack"
[[ -d "$INSTALL_LOCATION" ]] && cp -r "$OUTPUT_DEST" "$INSTALL_LOCATION"
