let nextButton = document.getElementById('next');
let prevButton = document.getElementById('prev');
let carousel = document.querySelector('.carousel');
let listHTML = document.querySelector('.carousel .list');
let seeMoreButtons = document.querySelectorAll('.seeMore');
let backButton = document.getElementById('back');

// Plant database with locations and AR model URLs
const herbData = {
    'ashwagandha': {
        lat: 23.2599, lng: 77.4126, name: 'Ashwagandha', region: 'Central India',
        medicinalUse: 'Stress relief, stamina boost',
        model: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/models/scene.gltf'
    },
    'tulsi': {
        lat: 28.7041, lng: 77.1025, name: 'Tulsi', region: 'Northern India',
        medicinalUse: 'Respiratory health, immunity',
        model: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/models/scene.gltf'
    },
    'cardamom': {
        lat: 10.8505, lng: 76.2711, name: 'Cardamom', region: 'Kerala, India',
        medicinalUse: 'Digestive health, respiratory wellness',
        model: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/models/scene.gltf'
    },
    'clove': {
        lat: -6.2088, lng: 106.8456, name: 'Clove', region: 'Indonesia',
        medicinalUse: 'Oral health, digestion, pain relief',
        model: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/models/scene.gltf'
    },
    'cinnamon': {
        lat: 6.9271, lng: 79.8612, name: 'Cinnamon', region: 'Sri Lanka',
        medicinalUse: 'Blood sugar control, digestion',
        model: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/models/scene.gltf'
    },
    'turmeric': {
        lat: 17.6868, lng: 83.2185, name: 'Turmeric', region: 'Andhra Pradesh, India',
        medicinalUse: 'Arthritis relief, digestion, liver support',
        model: 'https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/models/scene.gltf'
    }
};

let maps = {};
let arScenes = {};

// Initialize maps for each herb
function initializeMaps() {
    Object.keys(herbData).forEach(herb => {
        const mapContainer = document.getElementById(`map-${herb}`);
        if (mapContainer && !maps[herb]) {
            maps[herb] = L.map(mapContainer).setView([herbData[herb].lat, herbData[herb].lng], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(maps[herb]);
            L.marker([herbData[herb].lat, herbData[herb].lng])
                .addTo(maps[herb])
                .bindPopup(`${herbData[herb].name} - ${herbData[herb].region}<br>${herbData[herb].medicinalUse}`);
            // Add user location
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                L.marker([latitude, longitude]).addTo(maps[herb]).bindPopup('You are here!').openPopup();
                maps[herb].setView([latitude, longitude], 8);
            }, () => {
                console.log('Geolocation access denied');
            });
        }
    });
}

// Initialize AR scenes for each herb
function initializeAR() {
    Object.keys(herbData).forEach(herb => {
        const arContainer = document.getElementById(`ar-${herb}`);
        if (arContainer && !arScenes[herb]) {
            arContainer.innerHTML = `
                <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: false;">
                    <a-marker preset="hiro">
                        <a-entity gltf-model="${herbData[herb].model}" scale="0.5 0.5 0.5" position="0 0 0"></a-entity>
                        <a-entity text="value: ${herbData[herb].name}\n${herbData[herb].medicinalUse}; color: white; align: center;" position="0 1 0"></a-entity>
                    </a-marker>
                    <a-entity camera></a-entity>
                </a-scene>
            `;
            arScenes[herb] = true;
        }
    });
}

// Toggle map visibility
function toggleMap(herb) {
    const mapContainer = document.getElementById(`map-${herb}`);
    const arContainer = document.getElementById(`ar-${herb}`);
    if (mapContainer.style.display === 'none') {
        mapContainer.style.display = 'block';
        arContainer.style.display = 'none';
        if (maps[herb]) {
            maps[herb].invalidateSize();
        }
    } else {
        mapContainer.style.display = 'none';
    }
}

// Toggle AR visibility
function toggleAR(herb) {
    const mapContainer = document.getElementById(`map-${herb}`);
    const arContainer = document.getElementById(`ar-${herb}`);
    if (arContainer.style.display === 'none') {
        arContainer.style.display = 'block';
        mapContainer.style.display = 'none';
        if (!arScenes[herb]) {
            initializeAR();
        }
        alert('Point your camera at the Hiro marker to view the AR model. Download the marker from: https://jeromeetienne.github.io/AR.js/data/images/HIRO.jpg');
    } else {
        arContainer.style.display = 'none';
    }
}

nextButton.onclick = function(){
    showSlider('next');
}
prevButton.onclick = function(){
    showSlider('prev');
}
let unAcceppClick;
const showSlider = (type) => {
    nextButton.style.pointerEvents = 'none';
    prevButton.style.pointerEvents = 'none';
    carousel.classList.remove('next', 'prev');
    let items = document.querySelectorAll('.carousel .list .item');
    if(type === 'next'){
        listHTML.appendChild(items[0]);
        carousel.classList.add('next');
    }else{
        listHTML.prepend(items[items.length - 1]);
        carousel.classList.add('prev');
    }
    clearTimeout(unAcceppClick);
    unAcceppClick = setTimeout(()=>{
        nextButton.style.pointerEvents = 'auto';
        prevButton.style.pointerEvents = 'auto';
    }, 2000);
    // Hide all maps and AR scenes when sliding
    Object.keys(herbData).forEach(herb => {
        document.getElementById(`map-${herb}`).style.display = 'none';
        document.getElementById(`ar-${herb}`).style.display = 'none';
    });
}
seeMoreButtons.forEach((button) => {
    button.onclick = function(){
        carousel.classList.remove('next', 'prev');
        carousel.classList.add('showDetail');
        initializeMaps();
        initializeAR();
    }
});
backButton.onclick = function(){
    carousel.classList.remove('showDetail');
    // Hide all maps and AR scenes when going back
    Object.keys(herbData).forEach(herb => {
        document.getElementById(`map-${herb}`).style.display = 'none';
        document.getElementById(`ar-${herb}`).style.display = 'none';
    });
}