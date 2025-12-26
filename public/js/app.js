/**
 * Globomantics Robot Fleet - Command Center
 * Dashboard JavaScript Application
 */

// API Base URL
const API_BASE = '/api';

// State
let robots = [];
let healthData = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

/**
 * Initialize the dashboard
 */
async function initializeDashboard() {
    try {
        await Promise.all([
            fetchRobots(),
            fetchHealthData()
        ]);
        startAutoRefresh();
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

/**
 * Fetch all robots from the API
 */
async function fetchRobots() {
    try {
        const response = await fetch(`${API_BASE}/robots`);
        if (!response.ok) throw new Error('Failed to fetch robots');

        const data = await response.json();
        robots = data.data || data;

        renderRobotTable();
        updateMetrics();
        renderLocationList();
    } catch (error) {
        console.error('Error fetching robots:', error);
        showToast('Failed to fetch robot data', 'error');
    }
}

/**
 * Fetch health data from the API
 */
async function fetchHealthData() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) throw new Error('Failed to fetch health');

        healthData = await response.json();
        renderHealthPanel();
    } catch (error) {
        console.error('Error fetching health:', error);
        document.getElementById('apiHealth').querySelector('.health-status').textContent = 'Error';
        document.getElementById('apiHealth').querySelector('.health-status').className = 'health-status';
    }
}

/**
 * Render the robot table
 */
function renderRobotTable() {
    const tbody = document.getElementById('robotTableBody');

    if (!robots.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--gray-500);">
                    <i class="fas fa-robot" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    No robots found. Add your first robot to get started!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = robots.map(robot => `
        <tr data-id="${robot.id}">
            <td><code style="color: var(--globo-primary); font-weight: 600;">${robot.id}</code></td>
            <td>
                <strong>${robot.name}</strong>
            </td>
            <td>
                <span class="type-badge">${formatType(robot.type)}</span>
            </td>
            <td>
                <span class="status-badge ${robot.status}">${robot.status}</span>
            </td>
            <td>${formatLocation(robot.location)}</td>
            <td>
                <div class="battery-level">
                    <div class="battery-bar">
                        <div class="battery-fill ${getBatteryClass(robot.batteryLevel)}"
                             style="width: ${robot.batteryLevel}%"></div>
                    </div>
                    <span class="battery-text">${robot.batteryLevel}%</span>
                </div>
            </td>
            <td>${formatDate(robot.lastMaintenance)}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn view" onclick="viewRobot('${robot.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn maintenance" onclick="scheduleMaintenance('${robot.id}')" title="Schedule Maintenance">
                        <i class="fas fa-tools"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteRobot('${robot.id}')" title="Remove Robot">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Update metrics cards
 */
function updateMetrics() {
    const total = robots.length;
    const active = robots.filter(r => r.status === 'active').length;
    const maintenance = robots.filter(r => r.status === 'maintenance').length;
    const offline = robots.filter(r => r.status === 'offline' || r.status === 'inactive').length;
    const avgBattery = total > 0
        ? Math.round(robots.reduce((sum, r) => sum + r.batteryLevel, 0) / total)
        : 0;

    animateValue('totalRobots', total);
    animateValue('activeRobots', active);
    animateValue('maintenanceRobots', maintenance);
    animateValue('offlineRobots', offline);
    document.getElementById('avgBattery').textContent = `${avgBattery}%`;
}

/**
 * Animate value change
 */
function animateValue(elementId, newValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0;

    if (currentValue === newValue) {
        element.textContent = newValue;
        return;
    }

    const duration = 500;
    const steps = 20;
    const increment = (newValue - currentValue) / steps;
    let step = 0;

    const timer = setInterval(() => {
        step++;
        const value = Math.round(currentValue + (increment * step));
        element.textContent = value;

        if (step >= steps) {
            clearInterval(timer);
            element.textContent = newValue;
        }
    }, duration / steps);
}

/**
 * Render location list
 */
function renderLocationList() {
    const locationList = document.getElementById('locationList');
    const locations = {};

    robots.forEach(robot => {
        const loc = robot.location || 'unassigned';
        locations[loc] = (locations[loc] || 0) + 1;
    });

    const locationIcons = {
        'factory-floor-a': 'fa-industry',
        'factory-floor-b': 'fa-industry',
        'warehouse-1': 'fa-warehouse',
        'warehouse-2': 'fa-warehouse',
        'maintenance-bay': 'fa-tools',
        'charging-station': 'fa-charging-station',
        'unassigned': 'fa-question-circle'
    };

    locationList.innerHTML = Object.entries(locations)
        .sort((a, b) => b[1] - a[1])
        .map(([location, count]) => `
            <div class="location-item">
                <div class="location-info">
                    <div class="location-icon">
                        <i class="fas ${locationIcons[location] || 'fa-map-marker-alt'}"></i>
                    </div>
                    <span class="location-name">${formatLocation(location)}</span>
                </div>
                <span class="location-count">
                    <i class="fas fa-robot"></i> ${count}
                </span>
            </div>
        `).join('');
}

/**
 * Render health panel
 */
function renderHealthPanel() {
    if (!healthData) return;

    const healthStatus = document.getElementById('apiHealth').querySelector('.health-status');
    healthStatus.textContent = healthData.status === 'healthy' ? 'Healthy' : 'Degraded';
    healthStatus.className = `health-status ${healthData.status === 'healthy' ? 'healthy' : ''}`;

    document.getElementById('envValue').textContent = healthData.environment || 'development';
    document.getElementById('versionValue').textContent = healthData.version || '1.0.0';

    if (healthData.uptime) {
        const uptime = formatUptime(healthData.uptime);
        document.getElementById('uptimeValue').textContent = uptime;
    }
}

/**
 * Refresh all data
 */
async function refreshData() {
    const btn = event?.target?.closest('button');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
    }

    await Promise.all([fetchRobots(), fetchHealthData()]);

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
    }

    showToast('Dashboard data refreshed', 'success');
}

/**
 * Start auto-refresh every 30 seconds
 */
function startAutoRefresh() {
    setInterval(() => {
        fetchRobots();
        fetchHealthData();
    }, 30000);
}

/**
 * View robot details
 */
async function viewRobot(id) {
    const robot = robots.find(r => r.id === id);
    if (!robot) return;

    const content = document.getElementById('robotDetailsContent');
    content.innerHTML = `
        <div class="robot-details">
            <div class="detail-group">
                <div class="detail-label">Robot ID</div>
                <div class="detail-value id">${robot.id}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Name</div>
                <div class="detail-value">${robot.name}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Type</div>
                <div class="detail-value">
                    <span class="type-badge">${formatType(robot.type)}</span>
                </div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                    <span class="status-badge ${robot.status}">${robot.status}</span>
                </div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Location</div>
                <div class="detail-value">${formatLocation(robot.location)}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Battery Level</div>
                <div class="detail-value">
                    <div class="battery-level">
                        <div class="battery-bar" style="width: 100px;">
                            <div class="battery-fill ${getBatteryClass(robot.batteryLevel)}"
                                 style="width: ${robot.batteryLevel}%"></div>
                        </div>
                        <span class="battery-text">${robot.batteryLevel}%</span>
                    </div>
                </div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Last Maintenance</div>
                <div class="detail-value">${formatDate(robot.lastMaintenance) || 'Never'}</div>
            </div>
            <div class="detail-group">
                <div class="detail-label">Created</div>
                <div class="detail-value">${formatDate(robot.createdAt)}</div>
            </div>
        </div>
    `;

    document.getElementById('robotDetailsModal').classList.add('active');
}

/**
 * Close details modal
 */
function closeDetailsModal() {
    document.getElementById('robotDetailsModal').classList.remove('active');
}

/**
 * Show add robot modal
 */
function showAddRobotModal() {
    document.getElementById('addRobotModal').classList.add('active');
    document.getElementById('addRobotForm').reset();
}

/**
 * Close add robot modal
 */
function closeModal() {
    document.getElementById('addRobotModal').classList.remove('active');
}

/**
 * Add a new robot
 */
async function addRobot() {
    const form = document.getElementById('addRobotForm');
    const formData = new FormData(form);

    const robotData = {
        name: formData.get('name'),
        type: formData.get('type'),
        location: formData.get('location')
    };

    if (!robotData.name || !robotData.type) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/robots`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(robotData)
        });

        if (!response.ok) throw new Error('Failed to create robot');

        const result = await response.json();
        showToast(`Robot "${result.data.name}" created successfully!`, 'success');
        closeModal();
        await fetchRobots();
    } catch (error) {
        console.error('Error creating robot:', error);
        showToast('Failed to create robot', 'error');
    }
}

/**
 * Schedule maintenance for a robot
 */
async function scheduleMaintenance(id) {
    const robot = robots.find(r => r.id === id);
    if (!robot) return;

    if (!confirm(`Schedule maintenance for ${robot.name}?`)) return;

    try {
        const response = await fetch(`${API_BASE}/robots/${id}/maintenance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'routine',
                scheduledDate: new Date().toISOString()
            })
        });

        if (!response.ok) throw new Error('Failed to schedule maintenance');

        showToast(`Maintenance scheduled for ${robot.name}`, 'success');
        await fetchRobots();
    } catch (error) {
        console.error('Error scheduling maintenance:', error);
        showToast('Failed to schedule maintenance', 'error');
    }
}

/**
 * Delete a robot
 */
async function deleteRobot(id) {
    const robot = robots.find(r => r.id === id);
    if (!robot) return;

    if (!confirm(`Are you sure you want to remove ${robot.name}?`)) return;

    try {
        const response = await fetch(`${API_BASE}/robots/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete robot');

        showToast(`Robot "${robot.name}" removed`, 'success');
        await fetchRobots();
    } catch (error) {
        console.error('Error deleting robot:', error);
        showToast('Failed to remove robot', 'error');
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format robot type for display
 */
function formatType(type) {
    const types = {
        'assembly': 'Assembly',
        'welding': 'Welding',
        'quality-control': 'QC',
        'logistics': 'Logistics',
        'maintenance': 'Maintenance',
        'security': 'Security'
    };
    return types[type] || type;
}

/**
 * Format location for display
 */
function formatLocation(location) {
    if (!location) return 'Unassigned';
    return location
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Get battery class based on level
 */
function getBatteryClass(level) {
    if (level >= 60) return 'high';
    if (level >= 30) return 'medium';
    return 'low';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Format uptime
 */
function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}" style="color: var(--status-${type === 'error' ? 'danger' : type});"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Close modals on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDetailsModal();
    }
});

// Close modals on backdrop click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});
