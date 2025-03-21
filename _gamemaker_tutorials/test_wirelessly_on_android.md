---
layout: tutorial
roles: [
	 { type: article, people: [ rowan ] },
]
---

# GameMaker Mini Tutorial: Test on Android Wirelessly

If you’re developing Android games with GameMaker and want to test them on your device without the hassle of cables, you can set up wireless debugging using ADB (Android Debug Bridge).
This guide walks you through the steps to configure your PC and Android device for wireless debugging and connect GameMaker to your phone.  

---

### ✅ **Step 1: Locate ADB on Your Computer**  
ADB is part of the Android SDK platform tools. To find it:  
1. Open File Explorer on your PC.  
2. Navigate to:  
```
[Your android SDK location]\Android\Sdk\platform-tools
```
![image](../../assets/img/tutorial1/adb_location.png)

3. Inside this folder, you’ll see an executable called `adb.exe`. This is the tool you’ll use to connect wirelessly.  



---

### 📡 **Step 2: Enable Wireless Debugging on Your Android Device**  
You’ll need to turn on wireless debugging from your Android’s developer settings:  
1. Go to **Settings** on your phone.  
2. Tap **About Phone** and find the **Build Number**. Tap it 7 times to enable developer mode.  
3. Go back to **Settings** and open **Developer Options**.  
4. Scroll down search for **USB Debugging** - right below it, enable **Wireless Debugging**.  
![image](../../assets/img/tutorial1/developer_settings.jpg)
6. Tap the **Wireless Debugging** text to open the settings page.  
7. Select **Pair Device with Pairing Code**.  
![image](../../assets/img/tutorial1/wireless_debugging.jpg)
---

### 📡 **Step 3: Pair Your PC to Your Android Device**  
Now that wireless debugging is on, you’ll need to pair your device with your PC.  

1. Open **Command Prompt** on your PC.  
2. Navigate to the platform tools folder where `adb.exe` is located:  
3. To pair your phone, run:  
```
adb pair [IP address]:[Port]
```
👉 The IP address and port are displayed on your phone’s **Wireless Debugging** settings page.  
![image](../../assets/img/tutorial1/ip_addy.jpg)
4. Enter the pairing code shown on your phone when prompted.  
![image](../../assets/img/tutorial1/enter_pairing_code.png)
5. Once paired, your phone will confirm the connection.  

---

### 🔗 **Step 4: Connect Your Device Wirelessly**  
After pairing, you’ll need to connect your device for debugging:  

1. In the same Command Prompt window, type:  
```
adb connect [IP address]:[Port]
```
2. It should now say **connected**.  
![image](../../assets/img/tutorial1/adb_connect_command.png)

---

### 🎮 **Step 5: Detect Your Device in GameMaker**  
Now that your device is connected:  

1. Open **GameMaker**.  
2. Go to **Targets** from the top toolbar.  
3. Select **Device Editor**.  
![image](../../assets/img/tutorial1/device_editor.png)
4. Click **Detect Devices**.  
5. Your phone should appear as an available target for testing.  

---

### ⚠️ **Troubleshooting: Connection Issues**  
Wireless debugging can sometimes disconnect randomly.

If this happens simply type `adb connect [IP address]:[Port]`
again in Command Prompt to reconnect.  

That’s it! Now you can build and run your GameMaker projects wirelessly on your Android device. 🎉


