window.addEventListener('load', 
  function() { 
    alert('Unsilence your phone, and tap away!');
    if (Application.platform == RuntimePlatform.IPhonePlayer)
    {
       Device.deferSystemGesturesMode = SystemGestureDeferMode.BottomEdge;  
    }
  }, false);




async function setup() {
    const patchExportURL = "export/patch.export.json";

    // Create AudioContext
    const WAContext = window.AudioContext || window.webkitAudioContext;
    const context = new WAContext();

    // Create gain node and connect it to audio output
    const outputNode = context.createGain();
    outputNode.connect(context.destination);
    
    // Fetch the exported patcher
    let response, patcher;
    try {
        response = await fetch(patchExportURL);
        patcher = await response.json();
    
        if (!window.RNBO) {
            // Load RNBO script dynamically
            // Note that you can skip this by knowing the RNBO version of your patch
            // beforehand and just include it using a <script> tag
            await loadRNBOScript(patcher.desc.meta.rnboversion);
        }

    } catch (err) {
        const errorContext = {
            error: err
        };
        if (response && (response.status >= 300 || response.status < 200)) {
            errorContext.header = `Couldn't load patcher export bundle`,
            errorContext.description = `Check app.js to see what file it's trying to load. Currently it's` +
            ` trying to load "${patchExportURL}". If that doesn't` + 
            ` match the name of the file you exported from RNBO, modify` + 
            ` patchExportURL in app.js.`;
        }
        if (typeof guardrails === "function") {
            guardrails(errorContext);
        } else {
            throw err;
        }
        return;
    }
    
    // (Optional) Fetch the dependencies
    let dependencies = [];
    try {
        const dependenciesResponse = await fetch("export/dependencies.json");
        dependencies = await dependenciesResponse.json();

        // Prepend "export" to any file dependenciies
        dependencies = dependencies.map(d => d.file ? Object.assign({}, d, { file: "export/" + d.file }) : d);
    } catch (e) {}

    // Create the device
    let device;
    try {
        device = await RNBO.createDevice({ context, patcher });
    } catch (err) {
        if (typeof guardrails === "function") {
            guardrails({ error: err });
        } else {
            throw err;
        }
        return;
    }

    // Connect the device to the web audio graph
    device.node.connect(outputNode);

    // (Optional) Automatically create sliders for the device parameters
    makeSliders(device);

    // (Optional) Create a form to send messages to RNBO inputs
    clickInportForm(device);
 
    document.body.onclick = () => {
        context.resume();
    }
}

function loadRNBOScript(version) {
    return new Promise((resolve, reject) => {
        if (/^\d+\.\d+\.\d+-dev$/.test(version)) {
            throw new Error("Patcher exported with a Debug Version!\nPlease specify the correct RNBO version to use in the code.");
        }
        const el = document.createElement("script");
        el.src = "https://c74-public.nyc3.digitaloceanspaces.com/rnbo/" + encodeURIComponent(version) + "/rnbo.min.js";
        el.onload = resolve;
        el.onerror = function(err) {
            console.log(err);
            reject(new Error("Failed to load rnbo.js v" + version));
        };
        document.body.append(el);
    });
}

function makeSliders(device) {
    let pdiv = document.getElementById("rnbo-parameter-sliders");
    let noParamLabel = document.getElementById("no-param-label");
    if (noParamLabel && device.numParameters > 0) pdiv.removeChild(noParamLabel);

    // This will allow us to ignore parameter update events while dragging the slider.
    let isDraggingSlider = false;
    let uiElements = {};

    device.parameters.forEach(param => {
        // Subpatchers also have params. If we want to expose top-level
        // params only, the best way to determine if a parameter is top level
        // or not is to exclude parameters with a '/' in them.
        // You can uncomment the following line if you don't want to include subpatcher params
        
        //if (param.id.includes("/")) return;

        // Create a label, an input slider and a value display
        let label = document.createElement("label");
        let slider = document.createElement("input");
        let text = document.createElement("input");
        let sliderContainer = document.createElement("div");
        sliderContainer.appendChild(label);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(text);

        // Add a name for the label
        label.setAttribute("name", param.name);
        label.setAttribute("for", param.name);
        label.setAttribute("class", "param-label");
        label.textContent = `${param.name}: `;

        // Make each slider reflect its parameter
        slider.setAttribute("type", "range");
        slider.setAttribute("class", "param-slider");
        slider.setAttribute("id", param.id);
        slider.setAttribute("name", param.name);
        slider.setAttribute("min", param.min);
        slider.setAttribute("max", param.max);
        if (param.steps > 1) {
            slider.setAttribute("step", (param.max - param.min) / (param.steps - 1));
        } else {
            slider.setAttribute("step", (param.max - param.min) / 1000.0);
        }
        slider.setAttribute("value", param.value);

        // Make a settable text input display for the value
        text.setAttribute("value", param.value.toFixed(1));
        text.setAttribute("type", "text");

        // Make each slider control its parameter
        slider.addEventListener("pointerdown", () => {
            isDraggingSlider = true;
        });
        slider.addEventListener("pointerup", () => {
            isDraggingSlider = false;
            slider.value = param.value;
            text.value = param.value.toFixed(1);
        });
        slider.addEventListener("input", () => {
            let value = Number.parseFloat(slider.value);
            param.value = value;
        });

        // Make the text box input control the parameter value as well
        text.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") {
                let newValue = Number.parseFloat(text.value);
                if (isNaN(newValue)) {
                    text.value = param.value;
                } else {
                    newValue = Math.min(newValue, param.max);
                    newValue = Math.max(newValue, param.min);
                    text.value = newValue;
                    param.value = newValue;
                }
            }
        });

        // Store the slider and text by name so we can access them later
        uiElements[param.id] = { slider, text };

        // Add the slider element
        pdiv.appendChild(sliderContainer);
    });

    // Listen to parameter changes from the device
    device.parameterChangeEvent.subscribe(param => {
        if (!isDraggingSlider)
            uiElements[param.id].slider.value = param.value;
        uiElements[param.id].text.value = param.value.toFixed(1);
    });
}

function clickInportForm(device) {

    let inportForm1 = document.getElementById("inport-form1");
        inportForm1.onpointerdown = () => {
            // Send the message event to the RNBO device
            let volLevel = (event.clientX-inportForm1.offsetLeft)/inportForm1.offsetWidth;
            console.log("Button 1:", volLevel);
            let messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, "in1", [volLevel]);
            device.scheduleEvent(messageEvent);
        }



    let inportForm2 = document.getElementById("inport-form2");
        inportForm2.onpointerdown = () => {
            // Send the message event to the RNBO device
            let volLevel = (event.clientX-inportForm2.offsetLeft)/inportForm2.offsetWidth;
            console.log("Button 2:", volLevel);
            let messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, "in2", [volLevel]);
            device.scheduleEvent(messageEvent);
        }

   

    let inportForm3 = document.getElementById("inport-form3");
        inportForm3.onpointerdown = () => {
            // Send the message event to the RNBO device
            let volLevel = (event.clientX-inportForm3.offsetLeft)/inportForm3.offsetWidth;
            console.log("Button 3:", volLevel);
            let messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, "in3", [volLevel]);
            device.scheduleEvent(messageEvent);
        }

 

    let player1 = document.getElementById("player1");
        player1.onpointerdown = () => {
            let bgColor= "#4557B8";
            document.getElementById("inport-form1").style.display = "inline-block";
            document.getElementById("inport-form1").style.backgroundColor = bgColor;
            document.getElementById("inport-form1").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎄</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
            document.getElementById("inport-form2").style.display = "inline-block";
            document.getElementById("inport-form2").style.backgroundColor = bgColor;
            document.getElementById("inport-form2").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎅</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
            document.getElementById("inport-form3").style.display = "inline-block";
            document.getElementById("inport-form3").style.backgroundColor = bgColor;
            document.getElementById("inport-form3").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>⭐</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
            document.getElementById("player-div").style.display = "none";
            document.getElementById("reset2").style.display = "inline-block";
            document.getElementById("reset3").style.display = "inline-block";
            document.getElementById("reset4").style.display = "inline-block";

            // param is of type Parameter
            const param = device.parametersById.get("player_number");
            param.value = 1;
        }

    let player2 = document.getElementById("player2");
        player2.onpointerdown = () => {
            let bgColor= "#AE8B43";
            document.getElementById("inport-form1").style.display = "inline-block";
            document.getElementById("inport-form1").style.backgroundColor = bgColor;
            document.getElementById("inport-form1").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🔔</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
            document.getElementById("inport-form2").style.display = "inline-block";
            document.getElementById("inport-form2").style.backgroundColor = bgColor;
            document.getElementById("inport-form2").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎄</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
            document.getElementById("inport-form3").style.display = "inline-block";
            document.getElementById("inport-form3").style.backgroundColor = bgColor;
            document.getElementById("inport-form3").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎁</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
            document.getElementById("player-div").style.display = "none";
            document.getElementById("reset1").style.display = "inline-block";
            document.getElementById("reset3").style.display = "inline-block";
            document.getElementById("reset4").style.display = "inline-block";

            // param is of type Parameter
            const param = device.parametersById.get("player_number");
            param.value = 2;
        }

    let player3 = document.getElementById("player3");
        player3.onpointerdown = () => {
            let bgColor= "#4A8764";
            document.getElementById("inport-form1").style.display = "inline-block";
            document.getElementById("inport-form1").style.backgroundColor = bgColor;
            document.getElementById("inport-form1").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎅</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
            document.getElementById("inport-form2").style.display = "inline-block";
            document.getElementById("inport-form2").style.backgroundColor = bgColor;
            document.getElementById("inport-form2").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎊</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
            document.getElementById("inport-form3").style.display = "inline-block";
            document.getElementById("inport-form3").style.backgroundColor = bgColor;
            document.getElementById("inport-form3").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>⭐</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
            document.getElementById("player-div").style.display = "none";
            document.getElementById("reset1").style.display = "inline-block";
            document.getElementById("reset2").style.display = "inline-block";
            document.getElementById("reset4").style.display = "inline-block";

            // param is of type Parameter
            const param = device.parametersById.get("player_number");
            param.value = 3;
        }

    let player4 = document.getElementById("player4");
        player4.onpointerdown = () => {
            let bgColor= "#eb834f";
            document.getElementById("inport-form1").style.display = "inline-block";
            document.getElementById("inport-form1").style.backgroundColor = bgColor;
            document.getElementById("inport-form1").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🕯️</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
            document.getElementById("inport-form2").style.display = "inline-block";
            document.getElementById("inport-form2").style.backgroundColor = bgColor;
            document.getElementById("inport-form2").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🔔</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
            document.getElementById("inport-form3").style.display = "inline-block";
            document.getElementById("inport-form3").style.backgroundColor = bgColor;
            document.getElementById("inport-form3").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎄</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
            document.getElementById("player-div").style.display = "none";
            document.getElementById("reset1").style.display = "inline-block";
            document.getElementById("reset2").style.display = "inline-block";
            document.getElementById("reset3").style.display = "inline-block";

            // param is of type Parameter
            const param = device.parametersById.get("player_number");
            param.value = 4;
        }

let reset1 = document.getElementById("reset1");
reset1.onpointerdown = () => {
    let bgColor= "#4557B8";
    document.getElementById("inport-form1").style.backgroundColor = bgColor;
    document.getElementById("inport-form1").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎄</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
    document.getElementById("inport-form2").style.backgroundColor = bgColor;
    document.getElementById("inport-form2").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎅</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
    document.getElementById("inport-form3").style.backgroundColor = bgColor;
    document.getElementById("inport-form3").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>⭐</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
    document.getElementById("reset1").style.display = "none";
    document.getElementById("reset2").style.display = "inline-block";
    document.getElementById("reset3").style.display = "inline-block";
    document.getElementById("reset4").style.display = "inline-block";

    // param is of type Parameter
    const param = device.parametersById.get("player_number");
    param.value = 1;

}

let reset2 = document.getElementById("reset2");
reset2.onpointerdown = () => {
    let bgColor= "#AE8B43";
    document.getElementById("inport-form1").style.backgroundColor = bgColor;
    document.getElementById("inport-form1").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🔔</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
    document.getElementById("inport-form2").style.backgroundColor = bgColor;
    document.getElementById("inport-form2").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎄</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
    document.getElementById("inport-form3").style.backgroundColor = bgColor;
    document.getElementById("inport-form3").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎁</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
    document.getElementById("reset1").style.display = "inline-block";
    document.getElementById("reset2").style.display = "none";
    document.getElementById("reset3").style.display = "inline-block";
    document.getElementById("reset4").style.display = "inline-block";

    // param is of type Parameter
    const param = device.parametersById.get("player_number");
    param.value = 2;
}

let reset3 = document.getElementById("reset3");
reset3.onpointerdown = () => {
    let bgColor= "#4A8764";
    document.getElementById("inport-form1").style.backgroundColor = bgColor;
    document.getElementById("inport-form1").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎅</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
    document.getElementById("inport-form2").style.backgroundColor = bgColor;
    document.getElementById("inport-form2").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎊</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
    document.getElementById("inport-form3").style.backgroundColor = bgColor;
    document.getElementById("inport-form3").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>⭐</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
    document.getElementById("reset1").style.display = "inline-block";
    document.getElementById("reset2").style.display = "inline-block";
    document.getElementById("reset3").style.display = "none";
    document.getElementById("reset4").style.display = "inline-block";

    // param is of type Parameter
    const param = device.parametersById.get("player_number");
    param.value = 3;
}

let reset4 = document.getElementById("reset4");
reset4.onpointerdown = () => {
    let bgColor= "#eb834f";
    document.getElementById("inport-form1").style.backgroundColor = bgColor;
    document.getElementById("inport-form1").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🕯️</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
    document.getElementById("inport-form2").style.backgroundColor = bgColor;
    document.getElementById("inport-form2").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🔔</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
    document.getElementById("inport-form3").style.backgroundColor = bgColor;
    document.getElementById("inport-form3").innerHTML = "<p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>f</p><p style='margin: 0;'>🎄</p><p style='font-size:.5em; line-height: 1; margin: 0; opacity: .3;'>p</p>";
    document.getElementById("reset1").style.display = "inline-block";
    document.getElementById("reset2").style.display = "inline-block";
    document.getElementById("reset3").style.display = "inline-block";
    document.getElementById("reset4").style.display = "none";

    // param is of type Parameter
    const param = device.parametersById.get("player_number");
    param.value = 4;
}
}
setup();