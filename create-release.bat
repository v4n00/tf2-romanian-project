@REM @echo off
setlocal

set "OUTPUT_DEST=.\output\tf\custom\tf2-ro-pack"
if exist "%OUTPUT_DEST%" (
    rmdir /s /q "%OUTPUT_DEST%"
)
mkdir "%OUTPUT_DEST%"

set "LOGO_SOURCE=.\logo\new_tf2_logo.vtf"
set "LOGO_DEST=%OUTPUT_DEST%\materials\logo"
mkdir "%LOGO_DEST%"
copy "%LOGO_SOURCE%" "%LOGO_DEST%"

set "SOUND_SOURCE=.\voicelines"
set "SOUND_DEST=%OUTPUT_DEST%\sound\vo"
mkdir "%SOUND_DEST%"
for /R "%SOUND_SOURCE%" %%F in (*.*) do (
    if /I not "%%~xF"==".md" (
        copy "%%F" "%SOUND_DEST%"
    )
)

set "LOCALIZATION_SOURCE=.\localization"
set "LOCALIZATION_DEST=.\output\tf\resource"
mkdir "%LOCALIZATION_DEST%"
copy "%LOCALIZATION_SOURCE%" "%LOCALIZATION_DEST%"

echo Created release.
pause

endlocal