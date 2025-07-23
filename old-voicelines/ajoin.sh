for f in Medic_*.mp3; do
    echo "file '$f'" >> afile-list.txt
done
ffmpeg -f concat -safe 0 -i afile-list.txt -c copy Medic.mp3
