#!/usr/bin/node
const io = require('/volumio/node_modules/socket.io-client/lib/index.js'),
socket = io.connect('http://localhost:3000'),
fs  = require ("fs"),
cp = require("child_process");


function listPlugins(){
	return new Promise((resolve,reject)=>{
		let resolved = false;
		const timeout_in_ms = 1000,
		timeoutHandler = setTimeout(()=>{
			if(resolved) return;
			else reject(new Error("timeout reached while listing installed plugins. Is Volumio responding ?"))
		},timeout_in_ms);
		
		socket.on("pushInstalledPlugins", function handler(data) {
			resolved = true;
			clearTimeout(timeoutHandler);
			socket.off("pushInstalledPlugins",handler );
			resolve(data);
		});
		socket.emit("getInstalledPlugins");
	});
}

function listOutputDevices(){
	
	return new Promise((resolve,reject)=>{
		
		let resolved = false;
		const timeout_in_ms = 10000,
		timeoutHandler = setTimeout(()=>{
			if(resolved) return;
			else reject(new Error("timeout reached while listing available output devices. Is Volumio responding ?"))
		},timeout_in_ms);
		
		socket.on("pushOutputDevices", function handler(data) {
			resolved = true;
			clearTimeout(timeoutHandler);
			socket.off("pushOutputDevices",handler );
			resolve(data);
		});
		socket.emit("getOutputDevices");
	});
}


async function setOutputDeviceI2S(id){
	
	const devices = await listOutputDevices(),
	target_device = devices?.i2s?.available?.find(x=>x.id === id);
	
	if(target_device){
		console.log("device found : " + id);
		return setOutputDeviceI2S_unsafe(target_device);
	}
	
	return Promise.reject(new Error("cannot find device ", id));
	
}

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function setOutputDeviceI2S_unsafe(i2sidObject){
	
	return new Promise((resolve,reject)=>{
		
		let resolved = false;
		const timeout_in_ms = 3000,
		timeoutHandler = setTimeout(()=>{
			if(resolved) return;
			else reject(new Error("timeout reached while setting output device. Is Volumio responding ?"))
		},timeout_in_ms);
		
		socket.on("pushToastMessage", function handler(data) {
			if(data.type === "success"){
				resolved = true;
				clearTimeout(timeoutHandler);
				resolve(true);
			}
		});
		
		socket.emit("callMethod", {
			type: "controller",
			endpoint: "audio_interface/alsa_controller",
			method: "saveAlsaOptions",
			data : {
				i2s : true,
				i2sid : i2sidObject,
				output_device : {value: '0', label: 'Headphones'}
			}
		});
		
	});
}


function plugin_install_unsafe(plugin){
	
	console.log(`Requestion install for plugin ${plugin.name}`);
	return new Promise((resolve,reject)=>{
		socket.on("installPluginStatus", function handler(data) {
			console.clear();
			console.log(data, `plugin install ${plugin.name}... this can take a while.\nPlease do NOT touch anything either in SSH or in Volumio web interface : this WILL break things and you will have to start over again, possibly from reflashing the SD card.\nLast known progression : ${new Date().toString()}`)
			if(data.progress == 100){
				console.clear();
				console.log(`plugin installed ${plugin.name}`);
				socket.off("installPluginStatus",handler );
				resolve(true);
			}
			else if(data.progress === 0){
				socket.off("installPluginStatus",handler );
				reject(new Error(`Could not install ${plugin.name}`));
			}
		});
		socket.emit("installPlugin", plugin);
	});
}

async function plugin_install(plugin){
	console.log("plugin_install", plugin)
	const plugin_data = await listPlugins();
	if( plugin_data.find( p=>p.name === plugin.name ) ) return Promise.resolve(); // plugin is already installed
	return plugin_install_unsafe(plugin)
}

async function plugin_enable(plugin){
	
	const plugin_data = await listPlugins();
	installed_plugin = plugin_data.find( p=>p.name === plugin.name );
	
	if(!installed_plugin) return Promise.reject(`${plugin.name} is not installed`);
	if(installed_plugin.enabled) return Promise.resolve(`${plugin.name} is already enabled`);
	
	return new Promise( (resolve,reject)=>{
		socket.emit("pluginManager", {
			action: "enable",
			category: installed_plugin.category,
			name: installed_plugin.name
		});
		
		socket.on("pushInstalledPlugins",function handler(data){
			console.log("pushInstalledPlugins",data)
			const response_plugin = data.find(x=>x.name === installed_plugin.name);
			socket.off("pushInstalledPlugins",handler );
			if( response_plugin && response_plugin.enabled ){
				console.log("plugin enabled")
				return resolve(true)
			}
			else{
				console.warn("Error, could not enable Plugin");
				return reject();
			}	
		});
	});
}

async function installVirtualKeyBoard(){
	
	const plugin_data = await listPlugins();
	if(!plugin_data.find( p=>p.name === "touch_display" )) return Promise.reject(new Error("touch_display plugin is not installed"));
	
	const wgetVirtualKBArchive = new Promise( (resolve,reject)=>{
		cp.exec(`cd /home/volumio/
wget https://github.com/xontab/chrome-virtual-keyboard/archive/master.tar.gz
tar -xvzf master.tar.gz
rm -f master.tar.gz
`		, {uid: 1000,gid:1000}, (error,data)=>{
			if(error) return reject(error);
			return resolve(true);
	
		});
		
	});
	
	const patch = new Promise( (resolve,reject)=>{
			const path = "/opt/volumiokiosk.sh",
			extension_path = "/home/volumio/",
			handler = (error,data)=>{
				if(error) return Promise.reject(new Error("cannot read file " + path))
				const filecontent = data.toString(),
				patched_file_content = filecontent.replace(/http:\/\/localhost:3000.*?$/m, "http://localhost:3000 --load-extension=/home/volumio/chrome-virtual-keyboard-master\n")
				
				fs.writeFile(path,patched_file_content,{encoding:'utf8',flag:'w'}, (error)=>{
					if(!error) return resolve(true);
					return reject(error);
				})
				
				
			}
			fs.readFile(path, handler);
	});
	
	return wgetVirtualKBArchive.then(patch);
}


async function reboot(){
	return new Promise((resolve,reject)=>{
		cp.exec("reboot",(err,data)=>{
			if(err) return reject(err);
			resolve(true);
		});
	});
}



(async function(){
	
	const touch_plugin = {
		category: "system_hardware",
		name: "touch_display",
		url: "https://plugins.volumio.workers.dev/pluginsv2/downloadLatestStable/touch_display/volumio/buster/armhf"
	},
	audiophonicsonoff_plugin = {
		category: "system_hardware",
		name: "audiophonicsonoff",
		url: "https://plugins.volumio.workers.dev/pluginsv2/downloadLatestStable/audiophonicsonoff/volumio/buster/armhf"
	};
	
	try{
		await plugin_install(touch_plugin);
		await plugin_enable(touch_plugin);

		await installVirtualKeyBoard();

		await plugin_install(audiophonicsonoff_plugin);
		await plugin_enable(audiophonicsonoff_plugin);

		await setOutputDeviceI2S("audiophonics-es9028q2m-dac");

		console.log("done, device will reboot now");
		socket.close(); 

		await reboot();
		
	}
	catch(e){console.log("Error :",e)}
})();
