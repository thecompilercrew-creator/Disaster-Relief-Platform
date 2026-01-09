(function () {
    const dark = localStorage.getItem('darkMode') === '1';
    if (dark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
  })();
        // 🌙 Dark Mode (UI-only, hash-independent)
        function applyDarkMode(enable) {
            document.body.classList.toggle('dark', enable);
            document.documentElement.classList.toggle('dark',enable);
            localStorage.setItem('darkMode', enable ? '1' : '0');

            updateDarkToggleIcon();
            syncMapTheme();
        }

        function syncMapTheme() {
  if (!map || !lightTiles || !darkTiles) return;

  const dark = document.body.classList.contains('dark');

  if (dark) {
    map.removeLayer(lightTiles);
    darkTiles.addTo(map);
  } else {
    map.removeLayer(darkTiles);
    lightTiles.addTo(map);
  }
}


        function loadDarkMode() {
            const saved = localStorage.getItem('darkMode') === '1';
            document.body.classList.toggle('dark', saved);
            document.documentElement.classList.toggle('dark', saved);
            updateDarkToggleIcon();
        }

        document.body.style.opacity = 0;
        window.onload = () => {
            document.body.style.transition = "opacity 0.4s";
            document.body.style.opacity = 1;
        };

        const API_URL = 'you-backend-url.your-domain';
        let token = null;
        let currentUser = null;
        let isSignUp = false;

        

        let map;
let lightTiles;
let darkTiles;
        let mapInitialized = false;
        L.Marker.prototype.options.icon = L.divIcon({ className: 'hidden' });
        const requestMarkerIndex = new Map();
        
        // Update the refreshMapMarkers function
async function refreshMapMarkers() {
    const button = event.target; // Get the button that was clicked
    
    // Disable button during refresh
    button.disabled = true;
    button.textContent = '🔄 Refreshing...';
    
    // Add flicker effect - fade out
    requestMarkers.forEach(marker => {
        const element = marker.getElement();
        if (element) {
            element.style.transition = 'opacity 0.2s ease-out';
            element.style.opacity = '0';
        }
    });
    
    resourceMarkers.forEach(marker => {
        const element = marker.getElement();
        if (element) {
            element.style.transition = 'opacity 0.2s ease-out';
            element.style.opacity = '0';
        }
    });
    
    // Wait for fade out animation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Reload markers
    await Promise.all([
        loadRequestMarkers(),
        loadResourceMarkers()
    ]);
    
    // Fade in the markers
    await new Promise(resolve => setTimeout(resolve, 50));
    
    requestMarkers.forEach(marker => {
        const element = marker.getElement();
        if (element) {
            element.style.opacity = '0';
            element.style.transition = 'opacity 0.3s ease-in';
            setTimeout(() => {
                element.style.opacity = '1';
            }, 10);
        }
    });
    
    resourceMarkers.forEach(marker => {
        const element = marker.getElement();
        if (element) {
            element.style.opacity = '0';
            element.style.transition = 'opacity 0.3s ease-in';
            setTimeout(() => {
                element.style.opacity = '1';
            }, 10);
        }
    });
    
    // Re-enable button
    button.disabled = false;
    button.textContent = '🔄 Refresh Markers';
}
        function toggleResources(show) {
  resourceMarkers.forEach(marker =>
    show ? marker.addTo(map) : map.removeLayer(marker)
  );
}

function toggleRequests(show) {
  requestMarkers.forEach(marker =>
    show ? marker.addTo(map) : map.removeLayer(marker)
  );
}

        let requestMarkers = [];
let resourceMarkers = [];



        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            loadDarkMode();
            console.log('Page loaded, checking connection...');
            checkServerConnection();
            
            token = localStorage.getItem('token');
            if (token) {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.name) {
                    currentUser = user;
                    showApp();
                    // Handle initial hash or default to requests
                    handleHashChange();
                }
            }
            document.getElementById('authForm').addEventListener('submit', handleAuth);
            document.getElementById('toggleLink').addEventListener('click', toggleAuthMode);
            document.getElementById('requestForm').addEventListener('submit', handleRequestSubmit);
            document.getElementById('resourceForm').addEventListener('submit', handleResourceSubmit);
            
            // Listen for hash changes
            window.addEventListener('hashchange', handleHashChange);

            
            handleHashChange();
        });

        // Handle URL hash changes for routing
        function handleHashChange() {
            const hash = window.location.hash.slice(1) || 'requests';
            switchTab(hash);
            if (!realtimeInterval) startRealtimeRequests();
        }

        async function checkServerConnection() {
            try {
                const response = await fetch(API_URL + '/health');
                const data = await response.json();
                console.log('Server connection successful:', data);
            } catch (err) {
                console.error('Cannot connect to server:', err);
                showMessage('authMessage', 'Cannot connect to server. Make sure it is running on port 5000.', 'error');
            }
        }

        function toggleAuthMode() {
            isSignUp = !isSignUp;
            document.getElementById('authTitle').textContent = isSignUp ? 'Sign Up' : 'Sign In';
            document.getElementById('authSubmit').textContent = isSignUp ? 'Sign Up' : 'Sign In';
            document.getElementById('nameGroup').classList.toggle('hidden', !isSignUp);
            document.getElementById('phoneGroup').classList.toggle('hidden', !isSignUp);
            document.getElementById('toggleText').textContent = isSignUp ? 'Already have an account?' : "Don't have an account?";
            document.getElementById('toggleLink').textContent = isSignUp ? 'Sign In' : 'Sign Up';
            document.getElementById('authMessage').innerHTML = '';
        }

        async function handleAuth(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
            const data = { email, password };
            
            if (isSignUp) {
                data.name = document.getElementById('name').value;
                data.phone = document.getElementById('phone').value;
            }

            try {
                const response = await fetch(API_URL + endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    token = result.token;
                    currentUser = result.user;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(currentUser));
                    showApp();
                    window.location.hash = 'requests';
                } else {
                    showMessage('authMessage', result.error, 'error');
                }
            } catch (err) {
                showMessage('authMessage', 'Connection error. Please check if the server is running.', 'error');
            }
        }

        function logout() {
            token = null;
            currentUser = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.hash = '';
            document.getElementById('authView').classList.remove('hidden');
            document.getElementById('appView').classList.add('hidden');
            stopRealtimeRequests();
        }

        function showApp() {
            document.getElementById('authView').classList.add('hidden');
            document.getElementById('appView').classList.remove('hidden');
            document.getElementById('userName').textContent = currentUser.name;
            if (!realtimeInterval) startRealtimeRequests();
            injectMapTab();
        }

        function injectMapTab() {
    const tabs = document.querySelector('.tabs');
    if (!tabs || tabs.dataset.aiAdded) return;

    tabs.dataset.aiAdded = '1';

    tabs.insertAdjacentHTML(
        'beforeend',
        `
        <a href="#map" class="tab">Map View</a>
        <a href="#gemini" class="tab">Gemini AI</a>
        <a href="#news" class="tab">News</a>
        `
    );
}


       function switchTab(tab) {
  // Deactivate tabs
  document.querySelectorAll('.tab').forEach(t =>
    t.classList.remove('active')
  );

  // Hide all content (including tabs inside and outside content-area)
  document.querySelectorAll('.content-area > div').forEach(d =>
    d.classList.add('hidden')
  );
  
  // Also hide gemini tab specifically since it's outside content-area
  const geminiTab = document.getElementById('geminiTab');
  if (geminiTab) geminiTab.classList.add('hidden');

  // Activate tab button
  const activeTab = document.querySelector(`.tab[href="#${tab}"]`);
  if (activeTab) activeTab.classList.add('active');

  // Special: Map only
  if (tab === 'map') {
    renderMapView();
    return;
  }

  // Special: Gemini tab
  if (tab === 'gemini') {
    renderGeminiView();
    return;
  }

  // Show tab content
  const section = document.getElementById(tab + 'Tab');
  if (section) section.classList.remove('hidden');

  // Loaders
  if (tab === 'requests') loadRequests();
  if (tab === 'resources') loadResources();
  if (tab === 'myVolunteers') loadMyVolunteers();
  if (tab === 'news') loadNews();
}
      async function geocodeAddress(address) {
    if (!address || address.trim() === '') {
        console.warn('Empty address provided');
        return null;
    }
    
    try {
        // Wait to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        console.log('Geocoding:', address);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'DisasterReliefPlatform/1.0',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('Geocoding API error:', response.status, response.statusText);
            // Try alternative geocoding service
            return await geocodeAddressAlternative(address);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const coords = { 
                lat: parseFloat(data[0].lat), 
                lng: parseFloat(data[0].lon) 
            };
            console.log(`✓ Geocoded "${address}" to:`, coords);
            return coords;
        } else {
            console.warn(`✗ No results for address: "${address}"`);
            return null;
        }
    } catch (err) {
        console.error('Geocoding error for address:', address, err);
        // Try alternative method
        return await geocodeAddressAlternative(address);
    }
}

// Alternative geocoding using a different approach
async function geocodeAddressAlternative(address) {
    try {
        console.log('Trying alternative geocoding for:', address);
        
        // Use OpenCage or another service, or return a default location for testing
        // For now, let's return null and log the issue
        console.warn('Alternative geocoding not implemented, address failed:', address);
        
        // TEMPORARY: For testing, return a random location in India if address contains certain keywords
        if (address.toLowerCase().includes('test') || 
            address.toLowerCase().includes('demo')) {
            const randomLat = 20 + Math.random() * 10;
            const randomLng = 75 + Math.random() * 10;
            console.log('Using test coordinates:', { lat: randomLat, lng: randomLng });
            return { lat: randomLat, lng: randomLng };
        }
        
        return null;
    } catch (err) {
        console.error('Alternative geocoding also failed:', err);
        return null;
    }
}

function createTileLayers() {
  lightTiles = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }
  );

  darkTiles = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '© OpenStreetMap © CartoDB',
      maxZoom: 19
    }
  );
}

let realtimeInterval = null;
let lastRequestCount = 0;
let lastResourceCount = 0;

function startRealtimeRequests() {
    stopRealtimeRequests();
    realtimeInterval = setInterval(() => {
        const hash = window.location.hash.slice(1) || 'requests';
        if (hash === 'requests') loadRequests();
        if (hash === 'myVolunteers') loadMyVolunteers();
        if (hash === 'resources') loadResources();
        if (hash === 'map' && mapInitialized) checkForMapUpdates(); 
    }, 5000); // Refresh every 5 seconds
}

// New function to check if map needs updating without flickering
async function checkForMapUpdates() {
    try {
        const [reqRes, resRes] = await Promise.all([
            fetch(API_URL + '/api/requests?', {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(API_URL + '/api/resources?', {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        const requests = await reqRes.json();
        const resources = await resRes.json();

        // Only update if counts changed
        if (requests.length !== lastRequestCount) {
            lastRequestCount = requests.length;
            await loadRequestMarkers();
        }

        if (resources.length !== lastResourceCount) {
            lastResourceCount = resources.length;
            await loadResourceMarkers();
        }
    } catch (err) {
        console.error('Error checking for map updates:', err);
    }
}

function stopRealtimeRequests() {
        clearInterval(realtimeInterval);
        realtimeInterval = null;
    }
        async function renderMapView() {
  document.querySelectorAll('.content-area > div').forEach(d =>
    d.classList.add('hidden')
  );

  const tab = document.getElementById('mapTab');
  tab.classList.remove('hidden');

  // 🧠 Initialize map ONLY once
  if (mapInitialized) {
    setTimeout(() => map.invalidateSize(), 200);
    return;
  }

  mapInitialized = true;

  map = L.map('mapContainer').setView([20.5937, 78.9629], 5);

  // Tile layers
  lightTiles = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 19 }
  );

  darkTiles = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { maxZoom: 19 }
  );

  (document.body.classList.contains('dark') ? darkTiles : lightTiles).addTo(map);

  await loadMapMarkers();
  
  await loadResourceMarkers();
  await loadRequestMarkers();

  lastRequestCount = requestMarkers.length;
  lastResourceCount = resourceMarkers.length;

  if (requestMarkers.length) {
  const group = L.featureGroup(requestMarkers);
  map.fitBounds(group.getBounds().pad(0.3));
}

}
async function loadMapMarkers() {
  try {
    const res = await fetch(API_URL + '/api/requests', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const requests = await res.json();

    for (const req of requests) {
      const coords = await geocodeAddress(req.displayData.address);
      if (!coords) continue;
    }
  } catch (e) {
    console.error('Map load failed', e);
  }
}
      async function loadRequests() {
  const status = document.getElementById('statusFilter').value;
  const helpType = document.getElementById('helpTypeFilter').value;

  console.log('Filter values - Status:', status, 'HelpType:', helpType);

  try {
    const response = await fetch(API_URL + '/api/requests', {
      headers: { Authorization: `Bearer ${token}` }
    });

    let requests = await response.json();
    
    console.log('Total requests fetched:', requests.length);
    console.log('Sample request helpType:', requests[0]?.helpType);

    // Frontend STATUS filter
    if (status) {
      requests = requests.filter(req => req.status === status);
      console.log('After status filter:', requests.length);
    }

    // Frontend HELP TYPE filter
    if (helpType) {
      requests = requests.filter(req => req.helpType === helpType);
      console.log('After helpType filter:', requests.length);
    }

    console.log('Final requests to display:', requests.length);
    displayRequests(requests);

  } catch (err) {
    console.error('Load requests failed:', err);
    displayRequests(requests);
    if (mapInitialized) {
  loadRequestMarkers();
}
  }
}



        function renderRequestCard(req, compact = false) {
    // Add safety checks
    if (!req || !req.urgency || !req.helpType || !req.displayData) {
        console.warn('Invalid request data in renderRequestCard:', req);
        return '<div>Invalid request data</div>';
    }

    return `
        <div class="request-card urgency-${req.urgency.toLowerCase()}"
             onclick="focusRequestOnMap('${req._id}')"
             style="cursor:pointer;${compact ? 'margin:0;padding:12px;' : ''}">
            <div class="card-header">
                <div>
                    <div class="card-title">${req.helpType}</div>
                    <span class="urgency-badge badge-${req.urgency.toLowerCase()}">
                        ${req.urgency}
                    </span>
                </div>
            </div>

            <div class="card-meta">
                <strong>Name:</strong> ${req.displayData.name || 'N/A'}<br>
                <strong>Address:</strong> ${req.displayData.address || 'N/A'}<br>
                <strong>Phone:</strong> ${req.displayData.phone || 'N/A'}
            </div>

            ${!compact ? `<p><strong>Details:</strong> ${req.description || 'No details'}</p>` : ''}

            ${
                !req.isAuthorized
                    ? `<button class="btn-success"
                        onclick="event.stopPropagation(); volunteer('${req._id}')"
                        style="margin-top:10px;width:100%;">
                        Volunteer to Help
                    </button>`
                    : `<p style="color:#22c55e;font-weight:600;margin-top:8px;">
                        ✓ You have access
                    </p>`
            }
        </div>
    `;
}


        function displayRequests(requests) {
    const container = document.getElementById('requestsList');
    
    if (!requests || requests.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#666;">No requests found.</p>';
        return;
    }

    container.innerHTML = requests.map(req => {
        // Add safety checks
        if (!req || !req.urgency || !req.helpType || !req.displayData) {
            console.warn('Invalid request data:', req);
            return '';
        }

        return `
            <div class="request-card urgency-${req.urgency.toLowerCase()}">
                <div class="card-header">
                    <div>
                        <div class="card-title">${req.helpType}</div>
                        <span class="urgency-badge badge-${req.urgency.toLowerCase()}">${req.urgency}</span>
                        ${req.volunteerCount > 0 ? `<span class="volunteer-count">${req.volunteerCount} volunteer(s)</span>` : ''}
                    </div>
                </div>
                <div class="card-meta">
                    <strong>Name:</strong> ${req.displayData.name || 'N/A'}<br>
                    <strong>Address:</strong> ${req.displayData.address || 'N/A'}<br>
                    <strong>Phone:</strong> ${req.displayData.phone || 'N/A'}<br>
                    <strong>Email:</strong> ${req.displayData.email || 'N/A'}
                </div>
                <p style="margin-top:10px;"><strong>Details:</strong> ${req.description || 'No details provided'}</p>
                <p style="margin-top:5px;color:#666;font-size:12px;">Posted: ${req.createdAt ? new Date(req.createdAt).toLocaleString() : 'Unknown'}</p>
                ${!req.isAuthorized ? `
                    <div class="card-actions">
                        <button class="btn-success" onclick="volunteer('${req._id}')">Volunteer to Help</button>
                    </div>
                ` : `
                    <p style="margin-top:10px;color:#28a745;font-weight:600;">✓ You have access to full contact details</p>
                `}
            </div>
        `;
    }).filter(Boolean).join(''); // Filter out empty strings
}

        async function volunteer(requestId) {
            try {
                const response = await fetch(API_URL + '/api/volunteer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ requestId })
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Thank you for volunteering! You now have access to full contact details.');
                    loadRequests();
                } else {
                    alert(result.error);
                }
            } catch (err) {
                alert('Error volunteering for request');
            }
        }

        async function loadMyVolunteers() {
    try {
        const response = await fetch(API_URL + '/api/my-volunteers', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const result = await response.json();

        // 🔑 Normalize backend response
        const requests =
            Array.isArray(result) ? result :
            Array.isArray(result.requests) ? result.requests :
            Array.isArray(result.data) ? result.data :
            [];

        displayMyVolunteers(requests);

    } catch (err) {
        console.error('Error loading volunteers:', err);
        document.getElementById('myVolunteersList').innerHTML =
            '<p style="text-align:center;color:#dc3545;">Failed to load commitments.</p>';
    }
}

        
        function displayMyVolunteers(requests) {
            const container = document.getElementById('myVolunteersList');
            
            if (requests.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:#666;">You haven\'t volunteered for any requests yet.</p>';
                return;
            }

            container.innerHTML = requests.map(req => `
                <div class="request-card urgency-${req.urgency.toLowerCase()}">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${req.helpType}</div>
                            <span class="urgency-badge badge-${req.urgency.toLowerCase()}">${req.urgency}</span>
                        </div>
                    </div>
                    <div class="card-meta">
                        <strong>Name:</strong> ${req.displayData.name}<br>
                        <strong>Address:</strong> ${req.displayData.address}<br>
                        <strong>Phone:</strong> ${req.displayData.phone}<br>
                        <strong>Email:</strong> ${req.displayData.email}
                    </div>
                    <p style="margin-top:10px;"><strong>Details:</strong> ${req.description}</p>
                </div>
            `).join('');
        }


        async function loadResources() {
            try {
                const response = await fetch(API_URL + '/api/resources', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const resources = await response.json();
                displayResources(resources);
            } catch (err) {
                console.error('Error loading resources:', err);
            }
        }

        function displayResources(resources) {
            const container = document.getElementById('resourcesList');
            
            if (resources.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:#666;">No resources available.</p>';
                return;
            }

            container.innerHTML = resources.map(res => `
                <div class="resource-card">
                    <div class="card-header">
                        <div class="card-title">${res.type}</div>
                        <span class="volunteer-count">Qty: ${res.quantity}</span>
                    </div>
                    <div class="card-meta">
                        <strong>Location:</strong> ${res.location}<br>
                        ${res.description ? `<strong>Description:</strong> ${res.description}<br>` : ''}
                        ${res.expirationDate ? `<strong>Expires:</strong> ${new Date(res.expirationDate).toLocaleDateString()}<br>` : ''}
                        <strong>Contact:</strong> ${res.userId.name} (${res.userId.email})
                    </div>
                </div>
            `).join('');
        }

        async function handleRequestSubmit(e) {
    e.preventDefault();
    
    const address = document.getElementById('reqAddress').value;
    
    // Validate address is not generic
    if (address.toLowerCase().includes('test') && address.length < 10) {
        showMessage('requestMessage', 'Please enter a real address (e.g., "Delhi, India" or "Mumbai, Maharashtra")', 'error');
        return;
    }
    
    const data = {
        name: document.getElementById('reqName').value,
        address: address,
        phone: document.getElementById('reqPhone').value,
        email: document.getElementById('reqEmail').value,
        helpType: document.getElementById('reqHelpType').value,
        urgency: document.getElementById('reqUrgency').value,
        description: document.getElementById('reqDescription').value
    };

    try {
        const response = await fetch(API_URL + '/api/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('requestMessage', 'Request submitted successfully!', 'success');
            document.getElementById('requestForm').reset();
            await loadRequests(); 
            if (mapInitialized) {
                // Wait a bit longer for server to process
                await new Promise(resolve => setTimeout(resolve, 2000));
                await loadRequestMarkers(); 
            }
            setTimeout(() => {
                window.location.hash = 'requests';
            }, 2000);
        } else {
            showMessage('requestMessage', result.error, 'error');
        }
    } catch (err) {
        console.error('Error submitting request:', err);
        showMessage('requestMessage', 'Error submitting request', 'error');
    }
}

        async function handleResourceSubmit(e) {
            e.preventDefault();
            
            const data = {
                type: document.getElementById('resType').value,
                quantity: parseInt(document.getElementById('resQuantity').value),
                location: document.getElementById('resLocation').value,
                description: document.getElementById('resDescription').value,
                expirationDate: document.getElementById('resExpiration').value || undefined
            };

            try {
                const response = await fetch(API_URL + '/api/resources', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage('resourceMessage', 'Resource added successfully!', 'success');
                    document.getElementById('resourceForm').reset();
                    loadResources();
                    if (mapInitialized) {
                        loadResourceMarkers(); 
                    }
                    setTimeout(() => {
                        window.location.hash = 'resources';
                    }, 10000);
                } else {
                    showMessage('resourceMessage', result.error, 'error');
                }
            } catch (err) {
                showMessage('resourceMessage', 'Error adding resource', 'error');
            }
        }

        function showMessage(containerId, message, type) {
            const container = document.getElementById(containerId);
            container.innerHTML = `<div class="message message-${type}">${message}</div>`;
            setTimeout(() => container.innerHTML = '', 5000);
        }
        // 🌙☀️ Dark Mode Toggle Button
        const darkToggle = document.createElement('button');
        darkToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        font-size: 20px;
        padding: 0;
        `;

        function updateDarkToggleIcon() {
            if (darkToggle) {
                darkToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
            }
        }

        //Set initial icon
        updateDarkToggleIcon();

        darkToggle.onclick = () => {
            const enable = !document.body.classList.contains('dark');
            applyDarkMode(enable);
        };

        document.body.appendChild(darkToggle);

        function createRequestIcon() {
  return L.divIcon({
    className: 'request-marker',
    html: `
      <div style="
        background:#facc15;
        width:28px;
        height:28px;
        border-radius:50%;
        border:3px solid white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:16px;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
      ">⚠️</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}
  function createBadAddressIcon() {
  return L.divIcon({
    className: 'request-marker bad-address',
    html: `
      <div style="
        background:#ef4444;
        width:30px;
        height:30px;
        border-radius:50%;
        border:3px dashed white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:16px;
        box-shadow:0 2px 8px rgba(0,0,0,0.5);
      ">❓</div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

        function createResourceIcon() {
  return L.divIcon({
    className: 'resource-marker',
    html: `
      <div style="
        background:#22c55e;
        width:26px;
        height:26px;
        border-radius:50%;
        border:3px solid white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:14px;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
      ">📦</div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}
        async function loadResourceMarkers() {
  try {
    const res = await fetch(API_URL + '/api/resources', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const resources = await res.json();

    // Clear old markers
    resourceMarkers.forEach(m => map.removeLayer(m));
    resourceMarkers = [];

    for (const resource of resources) {
      const coords = await geocodeAddress(resource.location);
      if (!coords) continue;

      const marker = L.marker(
        [coords.lat, coords.lng],
        { icon: createResourceIcon() }
      ).addTo(map);

      marker.bindPopup(`
        <b>📦 ${resource.type}</b><br>
        <strong>Quantity:</strong> ${resource.quantity}<br>
        <strong>Location:</strong> ${resource.location}<br>
        ${resource.description ? `<p>${resource.description}</p>` : ''}
        <hr>
        <strong>Contact:</strong><br>
        ${resource.userId.name}<br>
        ${resource.userId.email}
      `);

      resourceMarkers.push(marker);
    }
  } catch (err) {
    console.error('Failed to load resources on map', err);
  }
}       
       async function loadRequestMarkers() {
  try {
    const res = await fetch(API_URL + '/api/requests', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const requests = await res.json();
    
    console.log('=== LOADING REQUEST MARKERS ===');
    console.log('Total requests:', requests.length);

    // Clear existing markers + index
    requestMarkers.forEach(m => map.removeLayer(m));
    requestMarkers = [];
    requestMarkerIndex.clear();

    let successCount = 0;
    let failCount = 0;

    // Process requests one at a time to respect rate limits
    for (let i = 0; i < requests.length; i++) {
      const req = requests[i];
      
      console.log(`Processing ${i + 1}/${requests.length}: ${req.helpType}`);

      const address =
        req.displayData?.address ||
        req.address ||
        req.location;

      if (!address) {
        console.warn('❌ No address for:', req.helpType);
        failCount++;
        continue;
      }

      let coords = await geocodeAddress(address);
let isBadAddress = false;

if (!coords) {
  console.warn('⚠️ Bad / vague address:', address);
  isBadAddress = true;

  // 📍 fallback location (center of India)
  coords = { lat: 20.5937, lng: 78.9629 };
}


      console.log('✓ Geocoded successfully');

     const marker = L.marker(
  [coords.lat, coords.lng],
  {
    icon: isBadAddress ? createBadAddressIcon() : createRequestIcon()
  }
)
.addTo(map)
.bindPopup(
  `
  ${isBadAddress ? `
    <div style="
      background:#fee2e2;
      color:#7f1d1d;
      padding:8px;
      border-radius:6px;
      font-weight:600;
      margin-bottom:6px;
    ">
      ⚠️ Address unclear or incomplete
    </div>
  ` : ''}

  ${renderRequestCard(req, true)}

  <div style="margin-top:10px;">
    <button
      onclick="showEditAddressForm('${req._id}', '${address.replace(/'/g, "\\'")}')"
      style="
        width:100%;
        background:#2563eb;
        color:white;
        padding:8px;
        border-radius:6px;
        border:none;
        cursor:pointer;
      ">
      ✏️ Edit address
    </button>
  </div>

  <div id="edit-address-${req._id}" style="display:none;margin-top:8px;">
    <input
      id="edit-input-${req._id}"
      type="text"
      value="${address}"
      style="width:100%;padding:6px;margin-bottom:6px;"
    />
    <button
      onclick="saveEditedAddress('${req._id}')"
      style="width:100%;background:#16a34a;color:white;padding:6px;border:none;border-radius:6px;">
      ✅ Save
    </button>
  </div>
  `,
  { maxWidth: 360 }
);


      requestMarkers.push(marker);
      requestMarkerIndex.set(req._id, marker);
      successCount++;
    }

    lastRequestCount = requests.length;
    
    console.log('=== COMPLETE ===');
    console.log(`✓ Success: ${successCount}, ❌ Failed: ${failCount}`);
    
  } catch (err) {
    console.error('Failed to load request markers', err);
    console.log(`⚠️ Bad/Vague addresses: ${failCount}`);
  }
}

function focusRequestOnMap(requestId) {
  const marker = requestMarkerIndex.get(requestId);
  if (!marker || !map) return;

  // Switch to map tab
  window.location.hash = 'map';

  setTimeout(() => {
    map.setView(marker.getLatLng(), 14, { animate: true });

    marker.openPopup();

    // ✨ Highlight effect
    const el = marker.getElement();
    if (el) {
      el.style.transition = 'transform 0.3s';
      el.style.transform = 'scale(1.4)';
      setTimeout(() => {
        el.style.transform = 'scale(1)';
      }, 600);
    }
  }, 300);
}

function showEditAddressForm(requestId) {
  const el = document.getElementById(`edit-address-${requestId}`);
  if (el) el.style.display = 'block';
}

async function saveEditedAddress(requestId) {
  const input = document.getElementById(`edit-input-${requestId}`);
  if (!input || !input.value.trim()) {
    alert('Please enter a valid address');
    return;
  }

  try {
    await updateRequestAddress(requestId, input.value.trim());

    alert('Address updated. Repositioning marker…');

    // 🔄 Reload map markers to re-geocode + move marker
    await loadRequestMarkers();

    // 🔄 Keep map view stable
    setTimeout(() => {
      const marker = requestMarkerIndex.get(requestId);
      if (marker) marker.openPopup();
    }, 300);

  } catch (err) {
    alert(err.message);
  }
}

async function updateRequestAddress(requestId, newAddress) {
  const res = await fetch(`${API_URL}/api/requests/${requestId}/address`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ address: newAddress })
  });

  const contentType = res.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    console.error('❌ Non-JSON response:', text);
    throw new Error('Server returned HTML instead of JSON');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to update address');
  }

  return data;
}

function renderGeminiView() {
    document.querySelectorAll('.content-area > div')
        .forEach(d => d.classList.add('hidden'));

    document.getElementById('geminiTab').classList.remove('hidden');
}

async function sendGeminiPrompt() {
    const prompt = document.getElementById('geminiPrompt').value.trim();
    if (!prompt) return;

    const chat = document.getElementById('geminiChat');

    // Add user message card
    chat.innerHTML += `
        <div class="gemini-message gemini-message-user">
            <div class="gemini-message-header">
                👤 You
            </div>
            <div class="gemini-message-content">${escapeHtml(prompt)}</div>
        </div>
    `;
    
    document.getElementById('geminiPrompt').value = '';
    chat.scrollTop = chat.scrollHeight;

    // Add loading indicator
    const loadingId = 'loading-' + Date.now();
    chat.innerHTML += `
        <div class="gemini-message gemini-message-ai" id="${loadingId}">
            <div class="gemini-message-header">
                🤖 Gemini
            </div>
            <div class="gemini-message-content">
                <em>Thinking...</em>
            </div>
        </div>
    `;
    chat.scrollTop = chat.scrollHeight;

    try {
        const res = await fetch(API_URL + '/api/gemini/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ prompt })
        });

        const data = await res.json();

        // Remove loading indicator and add actual response
        document.getElementById(loadingId).remove();
        
        chat.innerHTML += `
            <div class="gemini-message gemini-message-ai">
                <div class="gemini-message-header">
                    🤖 Gemini
                </div>
                <div class="gemini-message-content">${escapeHtml(data.reply)}</div>
            </div>
        `;

        chat.scrollTop = chat.scrollHeight;

    } catch (err) {
        // Remove loading indicator and show error
        document.getElementById(loadingId).remove();
        
        chat.innerHTML += `
            <div class="gemini-message gemini-message-error">
                <div class="gemini-message-header">
                    ⚠️ Error
                </div>
                <div class="gemini-message-content">
                    Gemini is currently unavailable. Please try again later.
                </div>
            </div>
        `;
        
        chat.scrollTop = chat.scrollHeight;
    }
}

// Helper function to escape HTML and preserve line breaks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

async function loadNews() {
    const container = document.getElementById('newsList');
    container.innerHTML = '<p style="text-align:center;color:#666;">Loading news…</p>';

    try {
        // Google News – Disaster Relief query
        const rssUrl =
            'https://news.google.com/rss/search?q=disaster+relief+India&hl=en-IN&gl=IN&ceid=IN:en';

        const response = await fetch(
            `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`
        );

        const data = await response.json();

        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, 'text/xml');
        const items = [...xml.querySelectorAll('item')].slice(0, 10);

        if (!items.length) {
            container.innerHTML =
                '<p style="text-align:center;color:#666;">No news available.</p>';
            return;
        }

        container.innerHTML = items
            .map(item => `
                <div class="request-card">
                    <div class="card-title">
                        <a href="${item.querySelector('link').textContent}"
                           target="_blank"
                           style="text-decoration:none;color:#2563eb;">
                            ${item.querySelector('title').textContent}
                        </a>
                    </div>
                    <div class="card-meta">
                        ${new Date(
                            item.querySelector('pubDate').textContent
                        ).toLocaleString()}
                    </div>
                </div>
            `)
            .join('');
    } catch (err) {
        console.error('News load failed', err);
        container.innerHTML =
            '<p style="text-align:center;color:#dc3545;">Failed to load news.</p>';
    }
}
