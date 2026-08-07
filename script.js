// Opsional: Kamu bisa pakai link online dari Teachable Machine (contoh: "https://teachablemachine.withgoogle.com/models/XXXXX/")
// Atau tetap pakai folder lokal: "./model/"
const URL = "./model/"; 

let model, webcam, labelContainer, maxPredictions;
let isCameraActive = false;

async function init() {
    if (isCameraActive) return;

    const infoDiv = document.getElementById("info");
    infoDiv.style.color = "#2e7d32";
    infoDiv.innerText = "Memuat model AI...";

    // Memastikan format URL benar
    const baseUrl = URL.endsWith("/") ? URL : URL + "/";
    const modelURL = baseUrl + "model.json";
    const metadataURL = baseUrl + "metadata.json";

    try {
        // 1. Memuat Model Teachable Machine
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        infoDiv.innerText = "Menghubungkan ke kamera...";

        // 2. Setup Webcam
        const flip = true; // Mengubah tampilan kamera jadi mode cermin
        webcam = new tmImage.Webcam(300, 300, flip);
        
        await webcam.setup(); // Meminta izin webcam ke browser
        await webcam.play();

        window.requestAnimationFrame(loop);

        // 3. Menampilkan Kamera di Web
        const webcamContainer = document.getElementById("webcam-container");
        webcamContainer.innerHTML = "";
        webcamContainer.appendChild(webcam.canvas);

        infoDiv.innerText = "Kamera Berhasil Aktif!";
        isCameraActive = true;

    } catch (error) {
        console.error("Detail Error:", error);
        
        // Menampilkan pesan eror asli di layar agar mudah didiagnosa
        infoDiv.style.color = "#d32f2f";
        infoDiv.innerHTML = `<b>Gagal:</b> ${error.message || error}`;
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    if (!model || !webcam) return;

    const prediction = await model.predict(webcam.canvas);

    let hasil = prediction[0];

    prediction.forEach((p) => {
        if (p.probability > hasil.probability) {
            hasil = p;
        }
    });

    document.getElementById("label-container").innerHTML =
        `<b>${hasil.className}</b> (${(hasil.probability * 100).toFixed(2)}%)`;
}

function scanSampah() {
    if (!isCameraActive) {
        alert("Aktifkan kamera terlebih dahulu!");
        return;
    }
    
    const hasilPrediksi = document.getElementById("label-container").innerText;
    const infoDiv = document.getElementById("info");
    infoDiv.style.color = "#2e7d32";
    infoDiv.innerText = "Hasil Scan Terakhir: " + hasilPrediksi;
}