// Global variable to store image aspect ratio
let imageAspectRatio = 1;

function handleImageUpload(event) {
    const file = event.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    // Check if file is an image
    if (!allowedTypes.includes(file?.type)) {
        alert('Please upload an image file (JPEG, PNG, GIF, or WEBP)');
        removeImage();
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Calculate aspect ratio
                imageAspectRatio = this.width / this.height;
                
                // Update preview
                document.getElementById('uploadPreview').src = e.target.result;
                document.getElementById('imagePreview').classList.remove('hidden');
                document.getElementById('projectImageDisplay').src = e.target.result;
                document.querySelector('.image-upload-label span').textContent = file.name;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    document.getElementById('projectImage').value = '';
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('uploadPreview').src = '';
    imageAspectRatio = 1;
    document.querySelector('.image-upload-label span').textContent = 'Upload Project Image';
}

// Add these event listeners
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('projectImage');
    
    imageInput.addEventListener('change', function(e) {
        // Clear previous file if exists
        if (this.files.length > 1) {
            alert('Please upload only one image');
            this.value = '';
            return;
        }
        handleImageUpload(e);
    });
    
    document.getElementById('removeImage').addEventListener('click', removeImage);
});

function showLoadingBar() {
    const form = document.getElementById('predictorForm');
    const loadingHtml = `
        <div class="loading-container">
            <div class="loading-text">Calculating...</div>
            <div class="loading-bar">
                <div class="loading-progress"></div>
            </div>
        </div>
    `;
    form.innerHTML = loadingHtml;
}

function showResults(results) {
    const container = document.querySelector('.loading-container');
    container.innerHTML = `
        <div class="prediction-results">
            <img src="${results.image}" alt="${results.name}" class="result-image">
            <h2>${results.name}</h2>
            <p class="ticker">${results.ticker}</p>
            <div class="market-cap">
                <h3>Predicted Market Cap:</h3>
                <p class="prediction-value">$${results.marketCap}</p>
            </div>
            <div class="disclaimer-unique">
                For best results ensure project is fully unique
            </div>
            <div class="feedback">
                <h4>Feedback:</h4>
                <p>${results.feedback}</p>
            </div>
            <button class="try-again-btn">Try Another Idea</button>
        </div>
    `;

    document.querySelector('.try-again-btn').addEventListener('click', resetForm);
}

function resetForm() {
    window.location.reload();
}

document.getElementById('predictorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const projectName = document.getElementById('projectName').value;
    const projectTicker = document.getElementById('projectTicker').value;
    const projectDescription = document.getElementById('projectDescription').value || '';
    const projectImage = document.getElementById('uploadPreview').src;
    const socialCount = [
        document.getElementById('twitter').value,
        document.getElementById('telegram').value,
        document.getElementById('website').value
    ].filter(url => url).length;

    let multiplier = 1;
    let feedback = [];

    // Adjusted short ticker bonus
    if (projectTicker.length >= 2 && projectTicker.length <= 4) {
        multiplier *= 1.2;
        feedback.push("Short ticker is a plus!");
    }

    // Adjusted AI mention bonus
    if (projectDescription.toLowerCase().includes('ai') || 
        projectDescription.toLowerCase().includes('artificial intelligence')) {
        multiplier *= 1.3;
        feedback.push("AI focus is trending!");
    }

    // Social media bonus
    multiplier *= (1 + (socialCount * 0.2));
    if (socialCount > 0) {
        feedback.push("Good social media presence.");
    }

    // Image aspect ratio bonus
    const aspectRatioDifference = Math.abs(imageAspectRatio - 1.0);
    if (aspectRatioDifference < 0.1) {
        multiplier *= (1.1 - aspectRatioDifference);
        feedback.push("Square image is visually appealing.");
    } else {
        multiplier *= (0.95);
    }

    let marketCap;

    // Special case for "Pumpfun Predictor"
    if (projectName.toLowerCase() === "pumpfun predictor") {
        marketCap = 1000000000; // 1 billion
        feedback.push("Special project detected!");
    } else {
        // New weighted random calculation
        const randomValue = Math.random();
        
        if (randomValue < 0.85) {
            marketCap = 7000 + Math.random() * 43000; // 7k to 50k
        } else if (randomValue < 0.99) {
            marketCap = 50000 + Math.random() * 20000; // 50k to 70k
        } else {
            marketCap = 100000 + Math.random() * 900000; // 100k to 1M
        }

        marketCap *= multiplier;
    }

    // Show loading bar
    showLoadingBar();

    // Simulate calculation time
    setTimeout(() => {
        showResults({
            name: projectName,
            ticker: projectTicker,
            marketCap: Math.round(marketCap).toLocaleString(),
            image: projectImage,
            feedback: feedback.join(' ')
        });
    }, 10000);
});
