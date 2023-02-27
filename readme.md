## :warning: Huge disclaimer :warning: 
**This branch is called *The Hacky Way* for a reason** : you should not use this code unless you know exactly what you are doing.

* The **safe** and **recommended** way to install Volumio 3 on your RaspTouch is [described here](https://github.com/audiophonics/rasptouch_volumio3). 

* This is an **unsafe** installation method that I wrote as a one-liner mainly for my own use when I need to automate the procedure.

* Use it at your own risks. If anything goes wrong you **will** have to reflash the SD card and restart everything from the beginning.

* Do **NOT** under *any circumstances* touch anything after running the line of code.
	* The display will prompt you to reboot at some point :no_entry_sign: ignore this request. Do not click anywhere in the web interface, either in your web browser or on the touch display. 
	* The RaspTouch will reboot by itself when the time is right.
	* The terminal in your SSH session will write explicitely : ```done, device will reboot now```. After the reboot, it is safe to use your RaspTouch the normal way.

*  The installation takes around 15-20 minutes even with a fast internet connection. It is normal, just be patient and again do not touch anything after running this line of code. 

* Please do not annoy Volumio team on their forum or website if anything went wrong with this. This is a last resort thing and you were expected to follow the [normal procedure](https://github.com/audiophonics/rasptouch_volumio3) in the first place.  



--- 

<details>
  <summary>I read the disclaimer, show me the code</summary>

  ### How to use this : 
* Write a fresh Volumio image on your SD card.
* Wait for Volumio to boot.
* Connect with SSH.	
* Run the following line of code.
	
  ### The following line of code :
```sh
sudo sh -c 'wget https://raw.githubusercontent.com/audiophonics/rasptouch_volumio3/the_hacky_way/sequencer.js -O - | node'
```
	
  ### How does it work ?
Volumio user interface is written in nodejs and uses socket.io as a transport.
This code spawns a nodejs process that connects to the socket.io websocket and sends all the required requests to install everything on your RaspTouch.
	
Volumio has no real way to tell the difference between this kind of requests and a regular user using the web interface the expected way.
	
Since this completely bypasses the user-account creation, I guess this will be patched someday. 
	
</details>

