; ───────────────────────────────────────────────────
; Billing-Software Installer Script for “Billing Software”
; Download & compile with the Inno Setup compiler:
; https://jrsoftware.org/isinfo.php
; ───────────────────────────────────────────────────

[Setup]
; App metadata
AppName=Billing Software
AppVersion=1.0
; Default installation folder (Program Files)
DefaultDirName={autopf}\main
; Start Menu folder name
DefaultGroupName=Billing Software
; Output installer name (without extension)
OutputBaseFilename=Billing-Software
; Compression options
Compression=lzma
SolidCompression=yes
; (No WizardPages= or CheckboxesRunDescription= here)

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
; Allow a desktop shortcut
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"; Flags: checkedonce

[Files]
; Main executable from your PyInstaller dist
Source: "dist\main.exe"; DestDir: "{app}"; Flags: ignoreversion
; Any other files/folders you need
Source: "bill.png";   DestDir: "{app}"; Flags: ignoreversion
Source: "web\*";      DestDir: "{app}\web";  Flags: recursesubdirs createallsubdirs
Source: "data\*";     DestDir: "{app}\data"; Flags: recursesubdirs createallsubdirs

[Icons]
; Start Menu icon
Name: "{group}\Billing Software"; Filename: "{app}\Billing-Software.exe"; WorkingDir: "{app}"
; Desktop icon (if task selected)
Name: "{commondesktop}\Billing Software"; Filename: "{app}\main.exe"; Tasks: desktopicon

[Run]
; Post-install “Launch Billing Software” checkbox
Filename: "{app}\main.exe"
