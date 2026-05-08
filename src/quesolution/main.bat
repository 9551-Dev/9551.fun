set adb=%appdata%/SideQuest/platform-tools/adb.exe

%adb% devices
%adb% usb attach
timeout /NOBREAK 3
cls
echo recconecting the quest
echo setting values
%adb% shell setprop debug.oculus.capture.width 1920
%adb% shell setprop debug.oculus.capture.height 1080
%adb% shell setprop debug.oculus.capture.bitrate 30000000
%adb% shell setprop debug.oculus.foveation.level 0
adb shell setprop debug.oculus.adaclocks.force 0
%adb% shell setprop debug.oculus.capture.fps 60

%adb% shell setprop debug.oculus.cpuLevel 4
%adb% shell setprop debug.oculus.gpuLevel 4

%adb% detach 

"./msg.vbs"

PAUSE