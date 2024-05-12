@echo off
setlocal

set "OUTPUT_DEST=.\output\tf\custom\tf2-ro-pack"
if exist ".\output\tf" (
    rmdir /s /q ".\output\tf"
)
mkdir "%OUTPUT_DEST%"

set "LOGO_SOURCE=.\logo\new_tf2_logo.vtf"
set "LOGO_DEST=%OUTPUT_DEST%\materials\logo"
mkdir "%LOGO_DEST%"
copy "%LOGO_SOURCE%" "%LOGO_DEST%"

set "SOUND_SOURCE=.\voicelines"
set "SOUND_DEST=%OUTPUT_DEST%\sound\vo"
mkdir "%SOUND_DEST%"
for /R "%SOUND_SOURCE%" %%F in (*.mp3) do (
    ffmpeg -y -i "%%F" -af "volume=3dB" "%SOUND_DEST%\%%~nxF"
)

set "LOCALIZATION_SOURCE=.\localization"
set "LOCALIZATION_DEST=.\output\tf\resource"
mkdir "%LOCALIZATION_DEST%"
copy "%LOCALIZATION_SOURCE%" "%LOCALIZATION_DEST%"

pause

endlocal