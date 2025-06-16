let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

const API_KEY = "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";
const WEATHER_API_KEY = "9c4fb4041e7621efe741f765298ecd44";

function speak(text) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    window.speechSynthesis.speak(utter);
}

window.onload = () => {
    const greeting = "Hello! I’m Prinu, your virtual assistant, created by Priyanshu. How can I help you?";
    content.innerText = greeting;
    speak(greeting);
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
}

const recognition = new SpeechRecognition();
recognition.lang = "en-IN";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let userMessage = "";

btn.addEventListener("click", () => {
    btn.disabled = true;
    voice.style.display = "block";
    recognition.start();
});

recognition.onstart = () => {
    window.speechSynthesis.cancel();
    console.log("🎤 Listening started...");
};

recognition.onresult = (event) => {
    userMessage = event.results[0][0].transcript.trim();
    console.log("🎤 You said:", userMessage);
    recognition.stop();
};

recognition.onspeechend = () => recognition.stop();

recognition.onend = () => {
    if (!userMessage) {
        content.innerText = "Didn't catch that. Try again.";
        speak("I didn't catch that. Try again.");
        reset();
        return;
    }

    const msg = userMessage.toLowerCase();

    const sites = {
        youtube: "https://youtube.com",
        google: "https://google.com",
        whatsapp: "https://web.whatsapp.com",
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        gmail: "https://mail.google.com",
        twitter: "https://twitter.com",
        amazon: "https://amazon.in",
        flipkart: "https://flipkart.com",
        spotify: "https://spotify.com"
    };

    for (let key in sites) {
        if (msg.includes("open " + key)) {
            content.innerText = `Opening ${key}...`;
            speak(`Opening ${key}`);
            window.open(sites[key], "_blank");
            reset();
            return;
        }
    }

    if (msg.includes("what is the time")) {
        const time = new Date().toLocaleTimeString();
        content.innerText = `The time is ${time}`;
        speak(`The time is ${time}`);
        reset();
        return;
    }

    if (msg.includes("what is today's date") || msg.includes("what is the date")) {
        const date = new Date().toDateString();
        content.innerText = `Today's date is ${date}`;
        speak(`Today's date is ${date}`);
        reset();
        return;
    }

    if (msg.startsWith("search google for")) {
        const query = msg.replace("search google for", "").trim();
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        content.innerText = `Searching Google for ${query}...`;
        speak(`Searching Google for ${query}`);
        window.open(url, "_blank");
        reset();
        return;
    }

    if (msg.includes("open camera")) {
        content.innerText = "Opening camera and taking a photo...";
        speak("Opening your camera and taking a photo");

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                let video = document.createElement("video");
                video.autoplay = true;
                video.srcObject = stream;
                video.style.position = "fixed";
                video.style.bottom = "10px";
                video.style.right = "10px";
                video.style.width = "240px";
                video.style.zIndex = "1000";
                document.body.appendChild(video);

                const canvas = document.createElement("canvas");
                canvas.width = 640;
                canvas.height = 480;
                canvas.style.display = "none";
                document.body.appendChild(canvas);

                setTimeout(() => {
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageDataUrl = canvas.toDataURL("image/png");

                    let img = document.createElement("img");
                    img.src = imageDataUrl;
                    img.style.width = "240px";
                    img.style.position = "fixed";
                    img.style.bottom = "10px";
                    img.style.left = "10px";
                    img.style.zIndex = "1000";
                    document.body.appendChild(img);

                    content.innerText = "Photo captured!";
                    speak("Photo captured!");
                    stream.getTracks().forEach(track => track.stop());
                    video.remove();
                }, 3000);
            })
            .catch(err => {
                console.error("Camera error:", err);
                content.innerText = "Failed to access camera.";
                speak("I couldn't open your camera.");
            });

        reset();
        return;
    }

    if (msg.includes("weather")) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;

                    fetch(weatherURL)
                        .then(res => res.json())
                        .then(data => {
                            const city = data.name;
                            const temp = data.main.temp;
                            const description = data.weather[0].description;
                            const weatherReport = `Currently in ${city}, it is ${temp} degrees Celsius with ${description}`;
                            content.innerText = weatherReport;
                            speak(weatherReport);
                            reset();
                        })
                        .catch(err => {
                            console.error(err);
                            content.innerText = "Unable to fetch weather details.";
                            speak("I couldn't get the weather update.");
                            reset();
                        });
                },
                (err) => {
                    content.innerText = "Location access denied.";
                    speak("Please enable location for weather updates.");
                    reset();
                }
            );
        } else {
            content.innerText = "Geolocation not supported.";
            speak("Your device does not support location.");
            reset();
        }
        return;
    }

    // 🤖 AI CHAT (OpenRouter API)
    fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct:free",
            messages: [{ role: "user", content: userMessage }]
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log("🧠 OpenRouter Response:", data);
        const reply = data?.choices?.[0]?.message?.content?.trim();

        if (reply && reply.length > 0) {
            content.innerText = reply;
            speak(reply);
        } else {
            content.innerText = "Sorry, I didn’t understand.";
            speak("Sorry, I didn’t understand.");
        }
    })
    .catch(err => {
        console.error("❌ API Error:", err);
        content.innerText = `Something went wrong: ${err.message}`;
        speak("Something went wrong. Please check the console for more info.");
    })
    .finally(() => {
        reset();
    });
};

function reset() {
    voice.style.display = "none";
    userMessage = "";
    setTimeout(() => {
        btn.disabled = false;
    }, 5000);
}


